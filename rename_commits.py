#!/usr/bin/env python3
import subprocess
import sys

# Define commit renames: {old_message: new_message}
commits_to_rename = {
    "first commit": "feat: initialize markdown editor project",
    "add .gitignore": "chore: add gitignore",
    "Update README.md": "docs: add comprehensive README",
    "fix: use main.js instead of main.ts for deployment": "fix: update script import to use main.js",
    "merge: resolve README conflict": "merge: resolve merge conflicts"
}

# Get all commits
result = subprocess.run(["git", "log", "--oneline", "--all"], capture_output=True, text=True)
commits = result.stdout.strip().split('\n')

for commit_line in reversed(commits):
    if not commit_line:
        continue
    
    commit_hash, *msg_parts = commit_line.split(' ', 1)
    old_msg = msg_parts[0] if msg_parts else ""
    
    # Check if this message needs renaming
    for old, new in commits_to_rename.items():
        if old in old_msg:
            print(f"Renaming: {commit_hash} '{old_msg}' -> '{new}'")
            # Using filter-branch to rename
            subprocess.run(f'git filter-branch -f --msg-filter "sed \'s/{old.replace("/", "\/")}/ {new}/\'" -- {commit_hash}', shell=True)
            break

print("Done!")
