import { CircularProgress } from "@chakra-ui/react";

export default function LoadingScreen({
  size,
  title = "",
}: {
  size: number;
  title?: string;
}) {
  return (
    <div className="h-[90vh] flex flex-col gap-4 items-center justify-center">
      {title && <h2>{title}</h2>}
      <CircularProgress isIndeterminate color="green.300" size={`${size}px`} />
    </div>
  );
}
