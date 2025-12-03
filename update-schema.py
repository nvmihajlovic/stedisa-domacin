import re

# Read original schema
with open('C:/Users/WEB STUDIO LINK/Documents/backups/domacin-final_2025-11-27_15-28-14/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Find User model and inject new fields after language field
pattern = r'(language\s+String\s+@default\("sr"\)\s*\n)(\s+createdAt)'
replacement = r'\1  emailVerified         Boolean  @default(false)\n  verificationToken     String?  @unique\n  verificationTokenExpiry DateTime?\n\2'

new_content = re.sub(pattern, replacement, content)

# Write new schema
with open('prisma/schema.prisma', 'w', encoding='utf-8', newline='\n') as f:
    f.write(new_content)

print("✓ Schema updated with email verification fields")
