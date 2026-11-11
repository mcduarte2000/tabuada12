# Iteration 8 — Rules that stop the same mistakes happening twice

* Status: completed
* Period: 2026-11-11
* Shipped in: v1.8.2

Closing iterations 5 to 7 exposed mistakes that the existing contract did not
prevent, and that I made repeatedly: a changelog announcing versions that were
never released, an untidy commit split attempted to hide two iterations sharing
files, a service worker serving a stale script that made a fixed bug look broken,
and behaviour changed beyond what was requested. This iteration turns each one
into a written rule and, where possible, into a failing check.

## Summary

| Metric | Value |
| --- | --- |
| User stories | 1 (US-32) |
| EARS requirements | 3 |
| Gherkin scenarios | 3 |
| Automated checks | 152 → 157 (97 static, 60 browser) |
| Defects found and fixed | 2 |
| External runtime requests | 0 → 0 |

## Scope

### In scope

- Record the mistakes in `AGENTS.md`, the file an agent reads first.
- Make the validator reject an untagged release on a clean tree.
- Make the version check cover all three places the number appears.

### Out of scope

- Changing how the product behaves. Nothing the child sees changes.
- Adding a new document; the rules belong where they will be read.

---

## US-32 — Do not repeat a mistake the project already paid for

**User story**

> As a maintainer, I want the mistakes already made here written down and
> enforced, so that an agent does not repeat them and I do not have to catch
> them by hand.

### Requirements

**R32.1 (ubiquitous)** The contract shall name each mistake already made in this
repository, and shall say to stop and ask rather than choose when one applies.

**R32.2 (unwanted behaviour)** If a release is described in `CHANGELOG.md` but the
newest tag does not point at `HEAD`, then the validator shall fail.

**R32.3 (ubiquitous)** The system of checks shall compare the version in
`app.js`, in `index.html` and in the top `CHANGELOG.md` entry.

### Acceptance criteria

```gherkin
Feature: Rules against repetition

  Scenario: An agent reads the contract
    Given an agent opens AGENTS.md
    Then it finds the list of mistakes already made
    And it is told to stop and ask when one applies

  Scenario: An untagged release
    Given the changelog describes a newer version than the newest tag
    When the documentation validator runs on a clean tree
    Then it fails, naming the tag that is behind

  Scenario: A version updated in one place only
    Given APP_VERSION, the markup placeholder and the changelog disagree
    When the regression suite runs
    Then it fails on the version check
```

---

## Defects found and fixed

| Defect | Cause | Fix |
| --- | --- | --- |
| The validator accepted an untagged release | The tag check passed whenever the working tree was dirty, which is always true before a commit | Require the newest tag to point at `HEAD`, with no dirty-tree escape |
| A version could be half-updated | The suite compared only `app.js` with the changelog, not the markup placeholder | Compare all three places |

Both fixes were verified by breaking them deliberately and watching the check
fail, rather than trusting that a passing check means a working check.

## Rules added to the contract

- **Inventing a release.** Check `git tag` against `HEAD`; a version that only
  existed in an uncommitted tree was never released.
- **Splitting uncommitted work.** When two iterations share files, commit them
  together instead of fabricating a tidy intermediate state.
- **Changing behaviour past what was asked.** Implement the request, then state
  the trade-off noticed.
- **Never trust a cached build.** Verify with the service worker blocked or
  unregistered.
- **Never quote a number you did not measure.** Test counts and sizes come from
  the run that just happened.
- **Commit, verify, then push.** Both suites pass on a dirty tree; that hides
  failures.

## Verification

Both suites pass on a clean tree:

```sh
node tests/regression.js          # 97 passed, 0 failed
python3 tests/validate-docs.py .  # 30 passed, 0 failed
```

Each of the four new contract checks was tested by deleting its rule from
`AGENTS.md` and confirming the matching check failed.
