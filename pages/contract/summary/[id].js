import { useRouter } from "next/router";

export default function SummaryPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <p>
        using public key: <code>{id}</code>
      </p>
    </div>
  );
}
