"""
FINCORE™ Microbiz Microfinance Bank - Python Core Banking Suite
"""
from .models import LoanApplication, LoanType, LoanStatus, RiskTier, BlockchainBlock, CBSTransaction, FieldMarketer
from .blockchain import ConsortiumPoALedger
from .cbs_engine import CoreBankingEngine
from .credit_underwriting import CreditScoringEngine
from .field_agency import FieldAgencyManager
from .ai_underwriter import AIUnderwriter

__version__ = "4.8.0"
__all__ = [
    "LoanApplication",
    "LoanType",
    "LoanStatus",
    "RiskTier",
    "BlockchainBlock",
    "CBSTransaction",
    "FieldMarketer",
    "ConsortiumPoALedger",
    "CoreBankingEngine",
    "CreditScoringEngine",
    "FieldAgencyManager",
    "AIUnderwriter"
]
