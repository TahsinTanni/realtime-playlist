// Calculates the position for a new playlist item based on previous and next positions
export function calculatePosition(prevPosition: number | null, nextPosition: number | null): number {
  // If both positions are missing, return default position 1.0
  if (!prevPosition && !nextPosition) return 1.0;
  // If only previous is missing, place before next
  if (!prevPosition) return nextPosition! - 1;
  // If only next is missing, place after previous
  if (!nextPosition) return prevPosition + 1;
  // Otherwise, place in the middle
  return (prevPosition + nextPosition) / 2;
}
