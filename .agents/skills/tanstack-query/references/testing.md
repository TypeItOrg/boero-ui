# Query tests

When tests are requested, reuse `test/utils/render-with-query-client.tsx` and the adjacent catalog tests. Each test needs an isolated cache; do not share a module-level QueryClient between tests.

Disable retries when the test is not about retry behavior. Use the existing fixture's cleanup and timing policy rather than setting gcTime to Infinity in every test.

Assert meaningful behavior: cancellation, parent/tenant isolation, page boundaries, error rendering or the expected cache update. A test of the query library's own getters or status constants rarely protects application behavior.

Run only the authorized verification. Tests in this reference are not a reason to add or run a suite during an unrelated task.
