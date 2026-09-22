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
    else:
        run_full_simulation()
