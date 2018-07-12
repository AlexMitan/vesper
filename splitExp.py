import re

list_start = re.compile("\(|'\(|#'\(")

with open("raw.lisp", "r") as f:
    raw = f.read()

raw = "(let ((x)) '('(''(x) #'() )"
# raw = "(let ((x 2))"
print(raw)
# while re.search('\([^ ]', raw):
raw = re.sub("\n", " ", raw)
raw = re.sub("\)", " ) ", raw)
raw = re.sub("\(", " ( ", raw)
raw = re.sub(" {2,}", " ", raw)

tokens = raw.split(" ")
# print([tok for tok in tokens if '(' in tok])
# level = 0
# print(re.findall(list_start, raw))
print(tokens)
refined = []
i = 0
while i < len(tokens):
    tok = tokens[i]
    if len(tok) > 0:
        if i+1 < len(tokens):
            # check for join
            combined = tokens[i] + tokens[i+1]
            if combined in ["'(", "#'("]:
                # print(combined, 'true')
                tok = combined
                i += 1
        refined.append(tok)
    i += 1
#     if re.search(list_start, tok):
#         refined += " " + tok + " "
#     if re.search("\)+", tok):
#         refined += re.sub("\)", " \) ", tok)

print(raw)
print(refined)

def myFunc(a):
    print(a)

def myOther(a):
    print(a)
