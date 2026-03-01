---
description: Standard process for bumping versions and updating the changelog.
---

# Release Process Workflow

Follow these steps exactly when performing a version bump or release to ensure the remote history remains clean and the local environment is ready for new changes.

## 1. Version Determination
- Check the `[Unreleased]` section in `CHANGELOG.md` for the nature of changes.
- Check the current `version` in `package.json`.
- Determine the new version number (e.g., if current is `0.3.0` and there are significant additions, next is `0.4.0`).

## 2. Prepare Files for Release
- **`package.json`**: Update the `version` field to the new version number.
- **`CHANGELOG.md`**:
    - Rename the `## [Unreleased]` section to `## [NewVersion] - YYYY-MM-DD`.
    - Ensure all changes from the `[Unreleased]` section are now under this new version header.
    - **CRITICAL**: Do NOT add a new empty `[Unreleased]` section at this stage.

## 3. Remote Push
- Stage the changes: `git add package.json CHANGELOG.md`.
- Commit the changes: `git commit -m "release: NewVersion"`.
- Push to the remote repository: `git push origin [branch]`.
- **Reasoning**: This ensures the remote repository only contains a record of delivered features, with no empty "placeholders" for future work.

## 4. Local Post-Release Setup
- **`CHANGELOG.md`**: Add a new empty `[Unreleased]` section at the top of the file (below the header but above the latest version).
- **DO NOT COMMIT** this change. Keep it as a local-only modification so it's ready for the next round of development but doesn't clutter the release commit history.

## 5. Summary
- Always double-check that the `CHANGELOG.md` pushed to GitHub does NOT contain an empty `[Unreleased]` section.
