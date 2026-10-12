export async function startApplication(
  translationsReady: Promise<unknown>,
  render: () => void
): Promise<void> {
  await translationsReady;
  render();
}
