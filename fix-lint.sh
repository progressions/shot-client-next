#!/bin/bash

# Fix unescaped entities in React components
echo "Fixing unescaped entities..."

# Fix apostrophes
find src -name "*.tsx" -exec sed -i '' "s/don't/don\&apos;t/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/can't/can\&apos;t/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/won't/won\&apos;t/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/it's/it\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/It's/It\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/you're/you\&apos;re/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/You're/You\&apos;re/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/you've/you\&apos;ve/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/You've/You\&apos;ve/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/we're/we\&apos;re/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/We're/We\&apos;re/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/they're/they\&apos;re/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/They're/They\&apos;re/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/I'm/I\&apos;m/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/I've/I\&apos;ve/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/let's/let\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/Let's/Let\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/here's/here\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/Here's/Here\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/there's/there\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/There's/There\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/that's/that\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/That's/That\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/what's/what\&apos;s/g" {} \;
find src -name "*.tsx" -exec sed -i '' "s/What's/What\&apos;s/g" {} \;

echo "Lint fixes applied!"