"""
export.py
=========
Turn a trained model on disk into something you can take with you. Two ways:

  1. ZIP   — package the whole model folder (weights + tokenizer + config)
             into a single .zip you can download. No account needed. This is
             also how you'd hand it to a teammate or commit it to GitHub.

  2. HUB   — push the exact same folder to the Hugging Face Hub, the standard
             home for sharing models. This is a REAL upload: it creates a repo
             under your account and uploads every file, so afterwards anyone
             can `from_pretrained("you/your-model")`.

The Hub token is passed in per request and is NEVER stored on disk or logged —
it lives only for the duration of the upload call.
"""

import os
import io
import zipfile


def _model_files(model_dir):
    # The files that make a loadable model: weights, tokenizer, config. We skip
    # our own evals.json + training_args.bin from the public artifact list view,
    # but for completeness we ship everything in the folder.
    files = []
    for name in sorted(os.listdir(model_dir)):
        p = os.path.join(model_dir, name)
        if os.path.isfile(p):
            files.append(name)
    return files


def zip_bytes(model_dir):
    """Return the whole model folder as an in-memory .zip (bytes)."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in _model_files(model_dir):
            zf.write(os.path.join(model_dir, name), arcname=name)
    buf.seek(0)
    return buf.getvalue()


def push_to_hub(model_dir, token, repo_id, private=True):
    """
    Upload the model folder to the Hugging Face Hub.

    token    : a HF access token with write scope (from hf.co/settings/tokens)
    repo_id  : "username/model-name" (the namespace must match the token owner)
    private  : keep the repo private (default) or make it public

    Returns {"url": ...} on success or {"error": ...} on failure. The token is
    used only for this call and is not persisted anywhere.
    """
    if not token:
        return {"error": "a Hugging Face write token is required"}
    if not repo_id or "/" not in repo_id:
        return {"error": "repo_id must look like 'username/model-name'"}

    try:
        from huggingface_hub import HfApi
        api = HfApi(token=token)

        # Fail fast with a clear message if the token is invalid, instead of a
        # cryptic error halfway through the upload.
        who = api.whoami()  # raises on a bad token

        api.create_repo(repo_id=repo_id, repo_type="model",
                        private=private, exist_ok=True)
        api.upload_folder(
            folder_path=model_dir,
            repo_id=repo_id,
            repo_type="model",
            # evals.json is ours, not part of the model — keep it out of the Hub repo.
            ignore_patterns=["evals.json"],
            commit_message="Upload router model trained in Model Lab",
        )
        return {
            "url": f"https://huggingface.co/{repo_id}",
            "repo_id": repo_id,
            "user": who.get("name") if isinstance(who, dict) else None,
            "private": private,
        }
    except Exception as e:
        return {"error": str(e)}
