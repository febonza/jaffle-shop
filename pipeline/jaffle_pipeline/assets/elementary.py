"""Generate the Elementary HTML report and place it where the React app expects it."""

from __future__ import annotations

import shutil
import subprocess

from dagster import MaterializeResult, MetadataValue, asset

from jaffle_pipeline.assets.dbt_assets import jaffle_dbt
from jaffle_pipeline.paths import (
    DBT_PROFILES_DIR,
    DBT_PROJECT_DIR,
    ELEMENTARY_OUTPUT,
)


@asset(
    name="elementary_report",
    group_name="observability",
    deps=[jaffle_dbt],
    compute_kind="elementary",
)
def elementary_report(context):
    """Run `edr report` and copy the resulting HTML into web/public/elementary/.

    Caller responsibility: the React app's /data-quality route iframes
    `/elementary/index.html`. We overwrite that bundle on every run.
    """
    ELEMENTARY_OUTPUT.mkdir(parents=True, exist_ok=True)
    # Wipe so a failed run doesn't leave stale assets around.
    for child in ELEMENTARY_OUTPUT.iterdir():
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()

    cmd = [
        "edr",
        "report",
        "--project-dir",
        str(DBT_PROJECT_DIR),
        "--profiles-dir",
        str(DBT_PROFILES_DIR),
        "--file-path",
        str(ELEMENTARY_OUTPUT / "index.html"),
    ]
    context.log.info("Running: " + " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        context.log.error(result.stdout)
        context.log.error(result.stderr)
        raise RuntimeError(f"edr exited {result.returncode}")

    report_path = ELEMENTARY_OUTPUT / "index.html"
    return MaterializeResult(
        metadata={
            "report_path": MetadataValue.path(str(report_path)),
        }
    )
