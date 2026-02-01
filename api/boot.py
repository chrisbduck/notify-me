"""Initialize paths for custom package imports in Azure Functions environment.

It seems a bit strange, but without this, the function app can't find the custom packages
- and since that includes the standard Azure packages, nothing works.
"""

import pathlib
import sys

# Return the path of this script file
def _get_script_path() -> pathlib.Path:
    return pathlib.Path(__file__).parent.resolve()

# Return the path of the package directory
def _get_package_path() -> pathlib.Path:
    return _get_script_path() / '.python_packages' / 'lib' / 'python3.11' / 'site-packages'

def init_paths():
    # Add the package path to the system path
    package_path = _get_package_path()
    if str(package_path) not in sys.path:
        sys.path.append(str(package_path))
