import os
import glob

for skill_dir in glob.glob("skills/*-perspective/"):
    path = os.path.join(skill_dir, "SKILL.md")
    print(f"Processing: {path}")

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'tags:' not in content:
        # Find the type: line and insert after it
        lines = content.split('\n')
        new_lines = []
        in_frontmatter = False
        frontmatter_count = 0

        for line in lines:
            if line.strip() == '---':
                frontmatter_count += 1
                new_lines.append(line)
                continue

            if frontmatter_count == 1:
                # Inside frontmatter
                if line.strip().startswith('type:') and 'tags:' not in content:
                    new_lines.append(line)
                    new_lines.append('tags: ["perspective", "author-style"]')
                    new_lines.append('applies_to: ["writer", "revise"]')
                    new_lines.append('priority: 50')
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)

        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f"  Updated: {path}")
    else:
        print(f"  Already has tags")
