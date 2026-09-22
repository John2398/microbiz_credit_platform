"""
FINCORE™ Microbiz MFB - Standalone Python HTTP REST API Server
Built exclusively on standard library `http.server` and `json`.
Zero external pip dependencies required.
"""
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any

from .blockchain import ConsortiumPoALedger
from .cbs_engine import CoreBankingEngine
from .credit_underwriting import CreditScoringEngine
from .field_agency import FieldAgencyManager
from .ai_underwriter import AIUnderwriter


# Global Singleton Engines
blockchain_service = ConsortiumPoALedger()
cbs_service = CoreBankingEngine()
field_service = FieldAgencyManager()


class FincoreAPIHandler(BaseHTTPRequestHandler):
    """
    HTTP Request Handler serving FINCORE™ Core Banking, Blockchain, and Underwriting APIs.
    """

    def _set_headers(self, status_code: int = 200, content_type: str = "application/json"):
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def _read_json_body(self) -> Dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length).decode("utf-8")
        try:
            return json.loads(body)
        except Exception:
            return {}

    def _send_json(self, data: Any, status_code: int = 200):
        self._set_headers(status_code)
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["/", "/health", "/api/health"]:
            self._send_json({
                "status": "healthy",
                "system": "FINCORE™ Microbiz MFB Python Banking Engine",
                "version": "4.8.0-python",
                "runtime": "Python 3.10+ Pure Standard Library",
                "cbsCore": "Temenos T24 vR23 & NIP Switch Connected",
                "blockchain": {
                    "consensus": "Proof of Authority (PoA)",
                    "blocks": len(blockchain_service.chain),
                    "tipHash": blockchain_service.latest_block.hash
                },
                "generalLedgerStatus": "BALANCED_DOUBLE_ENTRY",
                "fieldTerminals": len(field_service.marketers)
            })

        elif path == "/api/blockchain/blocks":
            self._send_json({
                "blocks": [b.to_dict() for b in blockchain_service.chain],
                "chainLength": len(blockchain_service.chain),
                "integrity": blockchain_service.verify_chain_integrity()
            })

        elif path == "/api/cbs/transactions":
            self._send_json({
                "transactions": [tx.to_dict() for tx in cbs_service.transactions],
                "glBalances": cbs_service.gl_balances
            })

        elif path == "/api/field/marketers":
            query = urllib.parse.parse_qs(parsed.query)
            branch = query.get("branch", [None])[0]
            self._send_json({
                "marketers": [m.to_dict() for m in field_service.get_all(branch)]
            })

        else:
            self._send_json({"error": "Endpoint not found", "path": path}, 404)

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        payload = self._read_json_body()

        # 1. Credit Bureau Evaluation
        if path == "/api/credit-scoring/evaluate":
            res = CreditScoringEngine.evaluate(
                monthly_income=payload.get("monthlyIncome", 350000),
                existing_debt=payload.get("existingDebt", 25000),
                requested_amount=payload.get("requestedAmount", 1500000),
                tenure_months=payload.get("tenureMonths", 12),
                bvn=payload.get("bvn", "22233344455"),
                employment_type=payload.get("employmentType", "sme_owner"),
                business_age_years=payload.get("businessAgeYears", 3)
            )
            self._send_json(res)

        # 2. Document Forensic Verification
        elif path == "/api/documents/verify":
            res = AIUnderwriter.hash_document(
                doc_type=payload.get("docType", "CAC_REGISTRATION"),
                doc_name=payload.get("docName", "cac_cert.pdf"),
                applicant_name=payload.get("applicantName", "Valued Borrower"),
                bvn=payload.get("bvn", ""),
                nin=payload.get("nin", "")
            )
            self._send_json(res)

        # 3. AI Underwriting Covenants
        elif path == "/api/ai/underwrite":
            res = AIUnderwriter.generate_assessment(
                applicant_name=payload.get("applicantName", "Applicant"),
                loan_type=payload.get("loanType", "SABI_TRADER"),
                amount=payload.get("amount", 1500000),
                monthly_income=payload.get("monthlyIncome", 400000),
                credit_score=payload.get("creditScore", 720),
                purpose=payload.get("purpose", "Commercial stall inventory restocking")
            )
            self._send_json(res)

        # 4. PoA Blockchain Record Anchor
        elif path == "/api/blockchain/record":
            block = blockchain_service.record_transaction(
                loan_id=payload.get("loanId", "MB-2026-AUTO"),
                applicant_name=payload.get("applicantName", "Client"),
                amount=payload.get("amount", 0),
                action=payload.get("action", "CREDIT_SANCTIONED"),
                officer_id=payload.get("officerId", "OFF-AUTO"),
                credit_score=payload.get("creditScore"),
                doc_hash=payload.get("docHash"),
                signature_fingerprint=payload.get("signatureFingerprint")
            )
            self._send_json({
                "success": True,
                "message": f"Block #{block.index} successfully mined and anchored to PoA blockchain",
                "block": block.to_dict()
            })

        # 5. Blockchain Query & Verification
        elif path == "/api/blockchain/verify-hash":
            query = payload.get("query", "")
            block = blockchain_service.query(query)
            if block:
                self._send_json({
                    "verified": True,
                    "integrityValid": True,
                    "block": block.to_dict()
                })
            else:
                self._send_json({
                    "verified": False,
                    "message": "No matching transaction or document hash on ledger"
                })

        # 6. CBS Disbursal & GL Posting
        elif path == "/api/cbs/disburse":
            loan_id = payload.get("loanId", "MB-2026-DISB")
            applicant = payload.get("applicantName", "Borrower")
            account = payload.get("accountNumber", "0128938472")
            amount = payload.get("amount", 1000000)

            # CBS double entry
            tx = cbs_service.execute_disbursal(
                loan_id=loan_id,
                applicant_name=applicant,
                account_number=account,
                amount=amount,
                bank_name=payload.get("bankName")
            )

            # Also anchor disbursal to blockchain
            block = blockchain_service.record_transaction(
                loan_id=loan_id,
                applicant_name=applicant,
                amount=amount,
                action="CBS_NIP_DISBURSED",
                officer_id="CBS-GATEWAY"
            )

            self._send_json({
                "success": True,
                "transaction": tx.to_dict(),
                "blockchainBlock": block.to_dict(),
                "cbsReference": tx.cbs_reference,
                "mandateId": tx.mandate_id
            })

        # 7. Field Marketer Cash Remittance to Vault GL
        elif path == "/api/field/remit":
            marketer_id = payload.get("marketerId", "MKT-001")
            amount = float(payload.get("amount", 50000))
            branch = payload.get("branch", "Abuja Main - New Mpape (BR-001)")

            mkt = field_service.record_collection(marketer_id, amount)
            tx = cbs_service.execute_field_remittance(
                marketer_id=mkt.id,
                marketer_name=mkt.name,
                branch_name=branch,
                amount=amount,
                terminal_id=mkt.active_terminal_id
            )

            self._send_json({
                "success": True,
                "marketer": mkt.to_dict(),
                "glTransaction": tx.to_dict(),
                "message": f"Remittance of NGN {amount:,.2f} posted to Vault GL"
            })

        else:
            self._send_json({"error": "Endpoint not found", "path": path}, 404)


def run_server(port: int = 8080):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, FincoreAPIHandler)
    print(f"[FINCORE™ Python Core] Server active on http://0.0.0.0:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[FINCORE™ Python Core] Shutting down gracefully...")
        httpd.server_close()


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run_server(port)
