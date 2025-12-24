import { Canvas } from "./_components/canvas";
import { Room } from "@/components/room";
import { Loading } from "./_components/loading";

interface BoardIdPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardIdPage({
  params,
}: BoardIdPageProps) {
  const { boardId } = await params;

  return (
    <Room roomId={boardId} fallback={<Loading/>}>
      <Canvas boardId={boardId} />
    </Room>

  );
}
