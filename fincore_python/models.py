"""
FINCORE™ Microbiz MFB - Data Models and Type Definitions
Pure Python 3.10+ with standard library dataclasses and enums.
"""
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime


class LoanType(str, Enum):
    SABI_TRADER = "SABI_TRADER"
    BETTABIZ_SME = "BETTABIZ_SME"
    MINIMONIE_GROUP = "MINIMONIE_GROUP"
    MICRO_MORTGAGE = "MICRO_MORTGAGE"
    EQUIPMENT_FINANCE = "EQUIPMENT_FINANCE"
    AGRO_LOAN = "AGRO_LOAN"


class LoanStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    DOCS_VERIFIED = "DOCS_VERIFIED"
    CREDIT_EVALUATED = "CREDIT_EVALUATED"
    OFFICER_REVIEW = "OFFICER_REVIEW"
    APPROVED = "APPROVED"
    DISBURSED = "DISBURSED"
    REJECTED = "REJECTED"


class RiskTier(str, Enum):
    PRIME_AAA = "PRIME_AAA"
    LOW_RISK_A = "LOW_RISK_A"
    MODERATE_BBB = "MODERATE_BBB"
    SUBPRIME_HIGH = "SUBPRIME_HIGH"


class CBSTransactionType(str, Enum):
    LOAN_DISBURSEMENT = "LOAN_DISBURSEMENT"
    REPAYMENT_COLLECTION = "REPAYMENT_COLLECTION"
    FIELD_CASH_REMITTANCE = "FIELD_CASH_REMITTANCE"
    FEE_ASSESSMENT = "FEE_ASSESSMENT"


@dataclass
class DocumentItem:
    id: str
    name: str
    type: str
    status: str
    hash: str
    verified_at: Optional[str] = None


@dataclass
class BlockchainTxRecord:
    hash: str
    block_index: int
    timestamp: str
    validator: str


@dataclass
class LoanApplication:
    id: str
    applicant_name: str
    phone: str
    email: str
    bvn: str
    nin: str
    account_number: str
    bank_name: str
    business_name: Optional[str]
    business_type: Optional[str]
    monthly_income: float
    existing_debt: float
    loan_type: LoanType
    amount: float
    tenure_months: int
    interest_rate_annual: float
    status: LoanStatus
    credit_score: Optional[int] = None
    dti: Optional[int] = None
    marital_status: Optional[str] = "MARRIED"  # "MARRIED" or "SINGLE"
    business_vintage_years: Optional[int] = 3
    shop_ownership: Optional[str] = "OWNED"  # "OWNED" or "RENTED"
    shop_ownership_doc: Optional[str] = "OWNERSHIP_INVOICE"  # "OWNERSHIP_INVOICE" or "RENT_RECEIPT"
    collateral_valuation: Optional[float] = 0.0
    stock_in_shop_valuation: Optional[float] = 0.0
    five_cs: Optional[Dict[str, Any]] = None
    documents: List[DocumentItem] = field(default_factory=list)
    signature: Optional[str] = None
    blockchain_tx: Optional[BlockchainTxRecord] = None
    cbs_reference: Optional[str] = None
    submitted_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['loan_type'] = self.loan_type.value
        data['status'] = self.status.value
        return data


@dataclass
class BlockchainBlock:
    index: int
    timestamp: str
    previous_hash: str
    hash: str
    data: Dict[str, Any]
    nonce: int
    validator: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CBSTransaction:
    tx_id: str
    timestamp: str
    system: str
    type: CBSTransactionType
    loan_id: str
    account_number: str
    account_name: str
    bank_name: str
    amount: float
    currency: str
    gl_debit_account: str
    gl_credit_account: str
    status: str
    mandate_id: str
    cbs_reference: str

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['type'] = self.type.value
        return data


@dataclass
class FieldMarketer:
    id: str
    name: str
    staff_code: str
    phone: str
    cluster: str
    assigned_branch: str
    daily_target: float
    daily_collections_actual: float
    active_terminal_id: str
    terminal_battery: int
    terminal_signal: str
    par30_rate: float
    active_borrowers_count: int
    last_ping: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
