> **MANDATORIO: Siempre responde en ESPAÑOL**

# Antigravity Skills

> **HÆ°á»›ng dáº«n táº¡o vÁ  sá»­ dá»¥ng Skills trong Antigravity Kit**

---

## ðŸ“‹ Giá»›i thiá»‡u

Máº·c dÁ¹ các mÁ´ hÁ¬nh cÆ¡ báº£n cá»§a Antigravity (nhÆ° Gemini) lÁ  nhá»¯ng mÁ´ hÁ¬nh Ä‘a nÄƒng máº¡nh máº½, nhÆ°ng chúng khÁ´ng biáº¿t ngá»¯ cáº£nh dá»± án cá»¥ thá»ƒ hoáº·c các tiÁªu chuáº©n cá»§a nhóm báº¡n. Viá»‡c táº£i tá»«ng quy táº¯c hoáº·c cÁ´ng cá»¥ vÁ o cá»­a sá»• ngá»¯ cáº£nh cá»§a tác nhÁ¢n sáº½ dáº«n Ä‘áº¿n tÁ¬nh tráº¡ng "phÁ¬nh to cÁ´ng cá»¥", chi phí cao hÆ¡n, Ä‘á»™ trá»… vÁ  sá»± nháº§m láº«n.

**Antigravity Skills** giáº£i quyáº¿t váº¥n Ä‘á» nÁ y thÁ´ng qua tính nÄƒng **Progressive Disclosure**. Ká»¹ nÄƒng lÁ  má»™t gói kiáº¿n thá»©c chuyÁªn biá»‡t, á»Ÿ tráº¡ng thái khÁ´ng hoáº¡t Ä‘á»™ng cho Ä‘áº¿n khi cáº§n. ThÁ´ng tin nÁ y chá»‰ Ä‘Æ°á»£c táº£i vÁ o ngá»¯ cáº£nh cá»§a tác nhÁ¢n khi yÁªu cáº§u cá»¥ thá»ƒ cá»§a báº¡n khá»›p vá»›i ná»™i dung mÁ´ táº£ cá»§a ká»¹ nÄƒng.

---

## ðŸ“ Cáº¥u trúc vÁ  Pháº¡m vi

Ká»¹ nÄƒng lÁ  các gói dá»±a trÁªn thÆ° má»¥c. Báº¡n có thá»ƒ xác Ä‘á»‹nh các pháº¡m vi nÁ y tuá»³ thuá»™c vÁ o nhu cáº§u:

| Pháº¡m vi | ÄÆ°á»ng dáº«n | MÁ´ táº£ |
|---------|-----------|-------|
| **Workspace** | `<workspace-root>/.agent/skills/` | Chá»‰ có trong má»™t dá»± án cá»¥ thá»ƒ |

### Cáº¥u trúc thÆ° má»¥c ká»¹ nÄƒng

```
my-skill/
â”œâ”€â”€ SKILL.md      # (Required) Metadata & instructions
â”œâ”€â”€ scripts/      # (Optional) Python or Bash scripts
â”œâ”€â”€ references/   # (Optional) Text, documentation, templates
â””â”€â”€ assets/       # (Optional) Images or logos
```

---

## ðŸ” Ví dá»¥ 1: Code Review Skill

ÄÁ¢y lÁ  má»™t ká»¹ nÄƒng chá»‰ có hÆ°á»›ng dáº«n (instruction-only), chá»‰ cáº§n táº¡o file `SKILL.md`.

### BÆ°á»›c 1: Táº¡o thÆ° má»¥c

```bash
mkdir -p ~/.gemini/antigravity/skills/code-review
```

### BÆ°á»›c 2: Táº¡o SKILL.md

```markdown
---
name: code-review
description: Reviews code changes for bugs, style issues, and best practices. Use when reviewing PRs or checking code quality.
---

# Code Review Skill

When reviewing code, follow these steps:

## Review checklist

1. **Correctness**: Does the code do what it's supposed to?
2. **Edge cases**: Are error conditions handled?
3. **Style**: Does it follow project conventions?
4. **Performance**: Are there obvious inefficiencies?

## How to provide feedback

- Be specific about what needs to change
- Explain why, not just what
- Suggest alternatives when possible
```

> **LÆ°u Á½**: File `SKILL.md` chá»©a siÁªu dá»¯ liá»‡u (name, description) á»Ÿ trÁªn cÁ¹ng, sau Ä‘ó lÁ  các chá»‰ dáº«n. Agent sáº½ chá»‰ Ä‘á»c siÁªu dá»¯ liá»‡u vÁ  chá»‰ táº£i hÆ°á»›ng dáº«n khi cáº§n.

### DÁ¹ng thá»­

Táº¡o file `demo_bad_code.py`:

```python
import time

def get_user_data(users, id):
    # Find user by ID
    for u in users:
        if u['id'] == id:
            return u
    return None

def process_payments(items):
    total = 0
    for i in items:
        # Calculate tax
        tax = i['price'] * 0.1
        total = total + i['price'] + tax
        time.sleep(0.1)  # Simulate slow network call
    return total

def run_batch():
    users = [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]
    items = [{'price': 10}, {'price': 20}, {'price': 100}]
    
    u = get_user_data(users, 3)
    print("User found: " + u['name'])  # Will crash if None
    
    print("Total: " + str(process_payments(items)))

if __name__ == "__main__":
    run_batch()
```

**Prompt**: `review the @demo_bad_code.py file`

Agent sáº½ tá»± Ä‘á»™ng xác Ä‘á»‹nh ká»¹ nÄƒng `code-review`, táº£i thÁ´ng tin vÁ  thá»±c hiá»‡n theo hÆ°á»›ng dáº«n.

---

## ðŸ“„ Ví dá»¥ 2: License Header Skill

Ká»¹ nÄƒng nÁ y sá»­ dá»¥ng file tham chiáº¿u (reference file) trong thÆ° má»¥c `resources/`.

### BÆ°á»›c 1: Táº¡o thÆ° má»¥c

```bash
mkdir -p .agent/skills/license-header-adder/resources
```

### BÆ°á»›c 2: Táº¡o file template

**`.agent/skills/license-header-adder/resources/HEADER.txt`**:

```
/*
 * Copyright (c) 2026 YOUR_COMPANY_NAME LLC.
 * All rights reserved.
 * This code is proprietary and confidential.
 */
```

### BÆ°á»›c 3: Táº¡o SKILL.md

**`.agent/skills/license-header-adder/SKILL.md`**:

```markdown
---
name: license-header-adder
description: Adds the standard corporate license header to new source files.
---

# License Header Adder

This skill ensures that all new source files have the correct copyright header.

## Instructions

1. **Read the Template**: Read the content of `resources/HEADER.txt`.
2. **Apply to File**: When creating a new file, prepend this exact content.
3. **Adapt Syntax**: 
   - For C-style languages (Java, TS), keep the `/* */` block.
   - For Python/Shell, convert to `#` comments.
```

### DÁ¹ng thá»­

**Prompt**: `Create a new Python script named data_processor.py that prints 'Hello World'.`

Agent sáº½ Ä‘á»c template, chuyá»ƒn Ä‘á»•i comments theo kiá»ƒu Python vÁ  tá»± Ä‘á»™ng thÁªm vÁ o Ä‘áº§u file.

---

## ðŸŽ¯ Káº¿t luáº­n

Báº±ng cách táº¡o Skills, báº¡n Ä‘Á£ biáº¿n mÁ´ hÁ¬nh AI Ä‘a nÄƒng thÁ nh má»™t chuyÁªn gia cho dá»± án cá»§a mÁ¬nh:

- âœ… Há»‡ thá»‘ng hoá các best practices
- âœ… TuÁ¢n theo quy táº¯c Ä‘ánh giá code
- âœ… Tá»± Ä‘á»™ng thÁªm license headers
- âœ… Agent tá»± Ä‘á»™ng biáº¿t cách lÁ m viá»‡c vá»›i nhóm cá»§a báº¡n

Thay vÁ¬ liÁªn tá»¥c nháº¯c AI "nhá»› thÁªm license" hoáº·c "sá»­a format commit", giá» Ä‘Á¢y Agent sáº½ tá»± Ä‘á»™ng thá»±c hiá»‡n!
