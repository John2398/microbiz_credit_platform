"""
FINCORE™ Microbiz MFB - Marketers & Field Agency Module
Monitors field agent POS terminals, daily cash targets, PAR30 ratios,
and vault remittance settlement.
"""
from typing import List, Dict, Any, Optional
from .models import FieldMarketer


class FieldAgencyManager:
    """
    Manages Microbiz MFB's field marketing force across market clusters.
    """

    def __init__(self):
        self.marketers: Dict[str, FieldMarketer] = {}
        self._seed_marketers()

    def _seed_marketers(self):
        initial = [
            FieldMarketer(
                id="MKT-001",
                name="Blessing Nwosu",
                staff_code="MB-STF-402",
                phone="+234 803 112 4490",
                cluster="Wuse Modern Market (Cluster A)",
                assigned_branch="Abuja Main - New Mpape (BR-001)",
                daily_target=450_000.0,
                daily_collections_actual=380_000.0,
                active_terminal_id="POS-WUS-019",
                terminal_battery=89,
                terminal_signal="4G LTE (MTN)",
                par30_rate=0.42,
                active_borrowers_count=64,
                last_ping="3 mins ago"
            ),
            FieldMarketer(
                id="MKT-002",
                name="Ibrahim Suleiman",
                staff_code="MB-STF-415",
                phone="+234 814 990 1234",
                cluster="Garki Model Market (Cluster B)",
                assigned_branch="Garki Commercial Branch (BR-002)",
                daily_target=600_000.0,
                daily_collections_actual=590_000.0,
                active_terminal_id="POS-GAR-042",
                terminal_battery=76,
                terminal_signal="4G LTE (Airtel)",
                par30_rate=0.28,
                active_borrowers_count=88,
                last_ping="Just now"
            ),
            FieldMarketer(
                id="MKT-003",
                name="Fatima Aliyu",
                staff_code="MB-STF-389",
                phone="+234 705 332 8901",
                cluster="Mpape Building Material Market",
                assigned_branch="Abuja Main - New Mpape (BR-001)",
                daily_target=350_000.0,
                daily_collections_actual=310_000.0,
                active_terminal_id="POS-MPP-007",
                terminal_battery=94,
                terminal_signal="4G LTE (MTN)",
                par30_rate=0.85,
                active_borrowers_count=51,
                last_ping="12 mins ago"
            ),
            FieldMarketer(
                id="MKT-004",
                name="Emeka Eze",
                staff_code="MB-STF-433",
                phone="+234 802 771 5562",
                cluster="Utako Ultra-Modern Market",
                assigned_branch="Utako Regional Hub (BR-003)",
                daily_target=500_000.0,
                daily_collections_actual=440_000.0,
                active_terminal_id="POS-UTK-011",
                terminal_battery=62,
                terminal_signal="3G HSPA (Glo)",
                par30_rate=0.91,
                active_borrowers_count=73,
                last_ping="8 mins ago"
            )
        ]
        for m in initial:
            self.marketers[m.id] = m

    def get_all(self, branch_filter: Optional[str] = None) -> List[FieldMarketer]:
        all_marketers = list(self.marketers.values())
        if branch_filter and branch_filter != "ALL":
            return [m for m in all_marketers if branch_filter in m.assigned_branch]
        return all_marketers

    def record_collection(self, marketer_id: str, amount: float) -> FieldMarketer:
        """
        Records a cash collection performed by a field marketer on their POS terminal.
        """
        if marketer_id not in self.marketers:
            raise ValueError(f"Marketer {marketer_id} not found")
        
        m = self.marketers[marketer_id]
        m.daily_collections_actual += float(amount)
        m.last_ping = "Just now"
        return m
