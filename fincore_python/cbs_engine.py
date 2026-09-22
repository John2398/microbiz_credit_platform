"""
FINCORE™ Microbiz MFB - Core Banking System (CBS) Engine
Simulates Temenos T24 / Finacle core integration, double-entry GL accounting,
and NIBSS Instant Payment (NIP) clearing.
"""
import random
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from .models import CBSTransaction, CBSTransactionType


class CoreBankingEngine:
    """
    Simulates Microbiz MFB's Core Banking System (CBS).
    Handles General Ledger (GL) double-entry postings, NUBAN verification, and NIP disbursal.
    """

    GL_RETAIL_LOANS = "GL-104020-LOANS-RETAIL"
    GL_CUSTOMER_CURRENT = "GL-200100-CUSTOMER-CURRENT"
    GL_BRANCH_VAULT = "GL-101010-BRANCH-VAULT"
    GL_AGENT_SUSPENSE = "GL-200300-FIELD-AGENT-SUSPENSE"
    GL_INTEREST_INCOME = "GL-400100-INTEREST-INCOME"

    def __init__(self):
        # Initial GL Balances (in NGN)
        self.gl_balances = {
            self.GL_RETAIL_LOANS: 148_500_000.0,
            self.GL_CUSTOMER_CURRENT: 412_980_450.0,
            self.GL_BRANCH_VAULT: 34_220_900.0,
            self.GL_AGENT_SUSPENSE: 12_450_000.0,
            self.GL_INTEREST_INCOME: 28_750_000.0
        }
        self.transactions: List[CBSTransaction] = []
        self._seed_initial_transactions()

    def _seed_initial_transactions(self):
        self.transactions.append(
            CBSTransaction(
                tx_id="CBS-FT-994012",
                timestamp="2026-09-14T14:32:06.000Z",
                system="FINCORE™ Temenos T24 / NIP Clearing",
                type=CBSTransactionType.LOAN_DISBURSEMENT,
                loan_id="MB-2026-8942",
                account_number="0128938472",
                account_name="Amina Bello Garba",
                bank_name="Microbiz MFB Current Account",
                amount=1_200_000.0,
                currency="NGN",
                gl_debit_account=self.GL_RETAIL_LOANS,
                gl_credit_account=self.GL_CUSTOMER_CURRENT,
                status="SETTLED",
                mandate_id="NIBSS-MANDATE-889104",
                cbs_reference="FT262570041289"
            )
        )

    def inquire_account(self, nuban: str) -> Dict[str, Any]:
        """
        Queries customer account status, tier KYC, and available balance.
        """
        cleaned = nuban.strip()
        is_known = cleaned.endswith("2")
        
        name = "Amina Bello Garba" if is_known else "Chinedu Okafor"
        return {
            "accountNumber": cleaned,
            "accountName": name,
            "bankName": "Microbiz Microfinance Bank Ltd",
            "bvn": f"22{random.randint(100000000, 999999999)}",
            "status": "ACTIVE_TIER_3",
            "tier": "Tier 3 (Unrestricted CBN Limits)",
            "availableBalance": 1_420_500.0 + random.randint(10000, 500000),
            "lienAmount": 0.0,
            "currency": "NGN"
        }

    def execute_disbursal(
        self,
        loan_id: str,
        applicant_name: str,
        account_number: str,
        amount: float,
        bank_name: Optional[str] = "Microbiz MFB Current Account"
    ) -> CBSTransaction:
        """
        Executes automated loan disbursal:
        Dr: Loans Asset GL (increasing loan portfolio asset)
        Cr: Customer Current Deposit GL (crediting customer account)
        """
        amount_float = float(amount)
        tx_id = f"CBS-FT-{random.randint(100000, 999999)}"
        mandate_id = f"NIBSS-MND-{random.randint(100000, 999999)}"
        cbs_ref = f"FT{datetime.utcnow().year}{random.randint(10000000, 99999999)}"

        # Double-entry ledger update
        self.gl_balances[self.GL_RETAIL_LOANS] += amount_float
        self.gl_balances[self.GL_CUSTOMER_CURRENT] += amount_float

        tx = CBSTransaction(
            tx_id=tx_id,
            timestamp=datetime.utcnow().isoformat() + "Z",
            system="FINCORE™ Temenos T24 / NIP Clearing",
            type=CBSTransactionType.LOAN_DISBURSEMENT,
            loan_id=loan_id,
            account_number=account_number,
            account_name=applicant_name,
            bank_name=bank_name or "Microbiz MFB",
            amount=amount_float,
            currency="NGN",
            gl_debit_account=self.GL_RETAIL_LOANS,
            gl_credit_account=self.GL_CUSTOMER_CURRENT,
            status="SETTLED",
            mandate_id=mandate_id,
            cbs_reference=cbs_ref
        )

        self.transactions.insert(0, tx)
        return tx

    def execute_field_remittance(
        self,
        marketer_id: str,
        marketer_name: str,
        branch_name: str,
        amount: float,
        terminal_id: str
    ) -> CBSTransaction:
        """
        Records cash collections remitted from field marketers into the branch vault:
        Dr: Cash in Vault GL (increasing cash)
        Cr: Field Agent Suspense GL (clearing agent collection liability)
        """
        amount_float = float(amount)
        tx_id = f"CBS-COL-{random.randint(100000, 999999)}"
        mandate_id = f"POS-MND-{terminal_id}"
        cbs_ref = f"VR{datetime.utcnow().year % 100}{random.randint(10000000, 99999999)}"

        # Double-entry ledger update
        self.gl_balances[self.GL_BRANCH_VAULT] += amount_float
        self.gl_balances[self.GL_AGENT_SUSPENSE] -= amount_float

        tx = CBSTransaction(
            tx_id=tx_id,
            timestamp=datetime.utcnow().isoformat() + "Z",
            system="FINCORE™ Field Collections Gateway / NIP Switch",
            type=CBSTransactionType.FIELD_CASH_REMITTANCE,
            loan_id=f"MKT-{marketer_id}",
            account_number=self.GL_BRANCH_VAULT,
            account_name=f"Vault Cash - {branch_name} ({marketer_name})",
            bank_name="Microbiz MFB Central Vault",
            amount=amount_float,
            currency="NGN",
            gl_debit_account=self.GL_BRANCH_VAULT,
            gl_credit_account=self.GL_AGENT_SUSPENSE,
            status="SETTLED",
            mandate_id=mandate_id,
            cbs_reference=cbs_ref
        )

        self.transactions.insert(0, tx)
        return tx
