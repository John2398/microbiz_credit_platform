"""
FINCORE™ Microbiz MFB - Consortium PoA Blockchain Ledger
Cryptographic immutability for loan sanctions, title deeds, and e-signatures.
"""
import hashlib
import json
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from .models import BlockchainBlock


class ConsortiumPoALedger:
    """
    Consortium Proof of Authority (PoA) Blockchain.
    Maintains cryptographic state across authorized Microbiz MFB validator nodes.
    """

    DEFAULT_VALIDATOR = "Microbiz-Node-01 (Abuja Data Centre)"

    def __init__(self):
        self.chain: List[BlockchainBlock] = []
        self._init_genesis_block()

    def _init_genesis_block(self):
        """Initializes Block 0 (Genesis)."""
        genesis_data = {
            "loanId": "GENESIS-BLOCK",
            "applicantName": "Microbiz MFB System Authority",
            "amount": 0,
            "action": "LEDGER_INITIALIZED",
            "cbnLicense": "MFB/RC-719401"
        }
        genesis_timestamp = "2026-09-10T08:00:00.000Z"
        genesis_hash = self.calculate_hash(
            index=0,
            previous_hash="0" * 64,
            timestamp=genesis_timestamp,
            data=genesis_data,
            nonce=1042
        )
        self.chain.append(
            BlockchainBlock(
                index=0,
                timestamp=genesis_timestamp,
                previous_hash="0" * 64,
                hash=genesis_hash,
                data=genesis_data,
                nonce=1042,
                validator="Microbiz-Consortium-Genesis"
            )
        )

    @staticmethod
    def calculate_hash(index: int, previous_hash: str, timestamp: str, data: Dict[str, Any], nonce: int) -> str:
        """
        Computes SHA-256 digest over index, previous_hash, timestamp, serialized data, and nonce.
        """
        payload = f"{index}-{previous_hash}-{timestamp}-{json.dumps(data, sort_keys=True)}-{nonce}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @property
    def latest_block(self) -> BlockchainBlock:
        return self.chain[-1]

    def record_transaction(
        self,
        loan_id: str,
        applicant_name: str,
        amount: float,
        action: str,
        officer_id: Optional[str] = "OFF-AUTO",
        credit_score: Optional[int] = None,
        doc_hash: Optional[str] = None,
        signature_fingerprint: Optional[str] = None,
        validator: Optional[str] = None
    ) -> BlockchainBlock:
        """
        Anchors a new transaction block into the ledger with SHA-256 cryptographic linkage.
        """
        prev_block = self.latest_block
        new_index = prev_block.index + 1
        timestamp = datetime.utcnow().isoformat() + "Z"
        nonce = int(time.time() * 1000) % 100000

        data = {
            "loanId": loan_id,
            "applicantName": applicant_name,
            "amount": float(amount),
            "action": action,
            "officerId": officer_id,
            "creditScore": credit_score,
            "docHash": doc_hash,
            "signatureFingerprint": signature_fingerprint
        }

        block_hash = self.calculate_hash(
            index=new_index,
            previous_hash=prev_block.hash,
            timestamp=timestamp,
            data=data,
            nonce=nonce
        )

        new_block = BlockchainBlock(
            index=new_index,
            timestamp=timestamp,
            previous_hash=prev_block.hash,
            hash=block_hash,
            data=data,
            nonce=nonce,
            validator=validator or self.DEFAULT_VALIDATOR
        )

        self.chain.append(new_block)
        return new_block

    def verify_chain_integrity(self) -> Dict[str, Any]:
        """
        Verifies every block from genesis to tip to confirm hashes are uncorrupted.
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # 1. Previous hash link check
            if current.previous_hash != previous.hash:
                return {
                    "valid": False,
                    "corrupted_block": current.index,
                    "error": f"Invalid previous hash link at block #{current.index}"
                }

            # 2. Hash recalculation check
            recalculated = self.calculate_hash(
                index=current.index,
                previous_hash=current.previous_hash,
                timestamp=current.timestamp,
                data=current.data,
                nonce=current.nonce
            )
            if recalculated != current.hash:
                return {
                    "valid": False,
                    "corrupted_block": current.index,
                    "error": f"Hash mismatch at block #{current.index}"
                }

        return {
            "valid": True,
            "total_blocks": len(self.chain),
            "tip_hash": self.latest_block.hash
        }

    def query(self, query_string: str) -> Optional[BlockchainBlock]:
        """
        Search for a block by hash, loanId, docHash, or signatureFingerprint.
        """
        target = query_string.strip().lower()
        for block in reversed(self.chain):
            if block.hash.lower() == target:
                return block
            data = block.data
            if data.get("loanId", "").lower() == target:
                return block
            if data.get("docHash", "").lower() == target:
                return block
            if data.get("signatureFingerprint", "").lower() == target:
                return block
        return None
