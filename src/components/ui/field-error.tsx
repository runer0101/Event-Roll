export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p className="mt-1.5 text-xs text-red-300" role="alert">
      {messages[0]}
    </p>
  );
}
