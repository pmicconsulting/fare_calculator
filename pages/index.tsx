import Head from "next/head";
import GoogleMap from "../components/GoogleMap"; // 地図＋計算ロジック一式
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>標準的運賃の計算【令和6年告示】</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.container}>
        <h1 className={styles.title}>
          標準的運賃の計算【令和6年告示】
        </h1>
        <section className={styles.mapWrapper}>
          <GoogleMap />
        </section>
      </main>
    </>
  );
}