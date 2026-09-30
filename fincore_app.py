#!/usr/bin/env python3
"""
FINCORE™ Microbiz MFB - Standalone Root Application & HTTP REST Server
Run CLI simulation:     python3 fincore_app.py
Run REST API server:    python3 fincore_app.py --server [port]
Run Test Suite:         python3 fincore_app.py --test
"""
import sys
import os

# Ensure package import resolution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fincore_python.main import run_full_simulation
from fincore_python.api_server import run_server


if __name__ == "__main__":
    if "--server" in sys.argv:
        port = 8080
        for i, arg in enumerate(sys.argv):
            if arg == "--server" and i + 1 < len(sys.argv):
                try:
                    port = int(sys.argv[i + 1])
                except ValueError:
                    pass
        run_server(port)
    elif "--test" in sys.argv:
        import unittest
        from fincore_python import test_fincore
        suite = unittest.TestLoader().loadTestsFromModule(test_fincore)
        unittest.TextTestRunner(verbosity=2).run(suite)
    elif "--audit" in sys.argv:
        from fincore_python.blockchain import ConsortiumPoALedger
        ledger = ConsortiumPoALedger()
        print(f"Chain Integrity Status: {'VALID' if ledger.verify_chain_integrity() else 'COMPROMISED'}")
        print(f"Current Height: {len(ledger.chain)} blocks | Tip Hash: {ledger.chain[-1].hash}")
    elif "--help" in sys.argv or "-h" in sys.argv:
        print("FINCORE™ Microbiz MFB Engine CLI Options:")
        print("  python fincore_app.py          : Execute complete end-to-end simulation")
        print("  python fincore_app.py --server : Launch standalone REST API server")
        print("  python fincore_app.py --test   : Execute unit tests suite")
        print("  python fincore_app.py --audit  : Verify consortium blockchain ledger integrity")
    else:
        run_full_simulation()
