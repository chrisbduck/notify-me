## Things I've discovered about Azure Static Web Apps and Azure Functions (in Python)

1. The SWA CLI is very nice, but when it fails, it tends to fail without an error message.
   * You can sometimes find a relevant error message by adding `--verbose silly` to the end of your `swa` command.
1. One reason that the CLI fails is because it doesn't actually support 3.12 (at the time of writing); just use 3.10 instead.
1. Another reason that the CLI fails is because it didn't find any functions to deploy; see below for why.
1. The new Python Azure Functions layout with all functions living in `api\function_app.py`, which is the format created by the various simple-creation scripts I've tried, is not supported *when deployed*.  It works fine locally, but if deployed, the functions won't be found.
   * Instead, you need to use v1 layout: `api\functionName\__init__.py` with a function called `main()`, and `api\functionName\function.json`.
1. By default, your Python function will probably fail to import due to missing packages, which will unfortunately be reported with just a 500 server error.
1. Despite many conflicting bits of information, Python packages and virtual environments are generally *not* properly built from requirements.txt after deployment.
   * Instead, you need to build up the set of *Linux* packages that you need in the folder `.python_packages\lib\python3.10\site-packages` and then manually add that to the path before trying to import any packages in your function.
   * `boot.py` does this, so it's easiest to just copy that.

## Azure Portal

1. Once you've successfully deployed, the default will be to deploy to the *preview* environment; but you can't see that from the main page of your Static Web App on Azure Portal.
   * Instead, go to Settings > Environments in the left panel, and you should be able to see it there.
1. "Waiting for deployment" on the main page of the Static Web App resource is probably actually telling the truth.
   * Odds are that `swa` didn't deploy correctly but didn't tell you.
