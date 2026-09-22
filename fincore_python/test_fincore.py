"""
Unit and Integration Tests for FINCORE™ Python Banking Suite
Run with: python3 -m unittest fincore_python.test_fincore
"""
import unittest
from .blockchain import ConsortiumPoALedger
from .cbs_engine import CoreBankingEngine
from .credit_underwriting import CreditScoringEngine
from .field_agency import FieldAgencyManager
from .ai_underwriter import AIUnderwriter


class TestFincoreBankingEngine(unittest.TestCase):

    def setUp(self):
        self.ledger = ConsortiumPoALedger()
        self.cbs = CoreBankingEngine()
        self.field = FieldAgencyManager()

    def test_blockchain_genesis(self):
        self.assertEqual(len(self.ledger.chain), 1)
        genesis = self.ledger.latest_block
        self.assertEqual(genesis.index, 0)
        self.assertEqual(genesis.previous_hash, "0" * 64)

    def test_blockchain_record_and_integrity(self):
        block1 = self.ledger.record_transaction(
            loan_id="TEST-001",
            applicant_name="Test Borrower",
            amount=500_000.0,
            action="CREDIT_SANCTIONED",
            credit_score=750
        )
        self.assertEqual(block1.index, 1)
        self.assertEqual(block1.previous_hash, self.ledger.chain[0].hash)

        # Integrity verification
        audit = self.ledger.verify_chain_integrity()
        self.assertTrue(audit["valid"])
        self.assertEqual(audit["total_blocks"], 2)

        # Query verification
        found = self.ledger.query("TEST-001")
        self.assertIsNotNone(found)
        self.assertEqual(found.data["loanId"], "TEST-001")

    def test_cbs_double_entry_disbursal(self):
        initial_loans_gl = self.cbs.gl_balances[self.cbs.GL_RETAIL_LOANS]
        initial_deposits_gl = self.cbs.gl_balances[self.cbs.GL_CUSTOMER_CURRENT]

        tx = self.cbs.execute_disbursal(
            loan_id="TEST-002",
            applicant_name="Test Applicant",
            account_number="0123456789",
            amount=1_000_000.0
        )

        self.assertEqual(tx.status, "SETTLED")
        self.assertEqual(tx.gl_debit_account, self.cbs.GL_RETAIL_LOANS)
        self.assertEqual(tx.gl_credit_account, self.cbs.GL_CUSTOMER_CURRENT)
        self.assertEqual(self.cbs.gl_balances[self.cbs.GL_RETAIL_LOANS], initial_loans_gl + 1_000_000.0)
        self.assertEqual(self.cbs.gl_balances[self.cbs.GL_CUSTOMER_CURRENT], initial_deposits_gl + 1_000_000.0)

    def test_credit_scoring_engine(self):
        res = CreditScoringEngine.evaluate(
            monthly_income=500_000.0,
            existing_debt=20_000.0,
            requested_amount=2_000_000.0,
            tenure_months=12,
            bvn="22345678901",
            employment_type="sme_owner",
            business_age_years=5
        )
        self.assertGreaterEqual(res["creditScore"], 300)
        self.assertLessEqual(res["creditScore"], 850)
        self.assertIn("debtToIncomeRatio", res["metrics"])
        self.assertIn(res["riskTier"], ["PRIME_AAA", "LOW_RISK_A", "MODERATE_BBB", "SUBPRIME_HIGH"])

    def test_field_agency_remittance(self):
        initial_vault = self.cbs.gl_balances[self.cbs.GL_BRANCH_VAULT]
        mkt = self.field.record_collection("MKT-001", 100_000.0)
        self.assertGreaterEqual(mkt.daily_collections_actual, 100_000.0)

        tx = self.cbs.execute_field_remittance(
            marketer_id=mkt.id,
            marketer_name=mkt.name,
            branch_name="Abuja Main",
            amount=100_000.0,
            terminal_id=mkt.active_terminal_id
        )
        self.assertEqual(self.cbs.gl_balances[self.cbs.GL_BRANCH_VAULT], initial_vault + 100_000.0)

    def test_ai_document_forensic_hash(self):
        doc = AIUnderwriter.hash_document(
            doc_type="CAC_CERT",
            doc_name="registration.pdf",
            applicant_name="John Doe",
            bvn="22998877665",
            nin="11223344556"
        )
        self.assertTrue(doc["verified"])
        self.assertEqual(len(doc["docHash"]), 64)  # SHA-256 length
        self.assertEqual(doc["tamperCheck"], "PASSED_UNMODIFIED")

    def test_credit_policy_5cs_and_collateral(self):
        # Test compliant 5 Cs evaluation
        evaluation = CreditScoringEngine.evaluate_5cs(
            amount=10_000_000.0,
            tenure_months=6,
            monthly_income=6_000_000.0,
            existing_debt=100_000.0,
            credit_score=780,
            collateral_valuation=16_000_000.0,  # 160% >= 150%
            stock_in_shop_valuation=3_500_000.0,  # 35% >= 30%
            business_age_years=4,
            marital_status="MARRIED",
            shop_ownership="OWNED",
            shop_ownership_doc="OWNERSHIP_INVOICE",
            has_guarantors_forms=True,
            has_6m_statements=True,
            has_collateral_docs=True,
            bvn_nin_verified=True
        )
        self.assertTrue(evaluation["allCsMet"])
        self.assertEqual(evaluation["character"]["status"], "MET")
        self.assertEqual(evaluation["capacity"]["status"], "MET")
        self.assertEqual(evaluation["capital"]["status"], "MET")
        self.assertEqual(evaluation["collateral"]["status"], "MET")
        self.assertEqual(evaluation["condition"]["status"], "MET")
        self.assertEqual(evaluation["overallEligibility"], "ELIGIBLE_FOR_SANCTION")

        # Test failure when collateral is under 150%
        deficient_collateral = CreditScoringEngine.evaluate_5cs(
            amount=10_000_000.0,
            tenure_months=6,
            monthly_income=4_500_000.0,
            existing_debt=100_000.0,
            credit_score=780,
            collateral_valuation=12_000_000.0,  # 120% < 150%
            stock_in_shop_valuation=3_500_000.0,
            business_age_years=4,
            marital_status="MARRIED",
            shop_ownership="OWNED",
            shop_ownership_doc="OWNERSHIP_INVOICE"
        )
        self.assertFalse(deficient_collateral["allCsMet"])
        self.assertEqual(deficient_collateral["collateral"]["status"], "UNMET")


if __name__ == "__main__":
    unittest.main()
