import { usePageTransition } from "../hooks/PageTransition"
import "./Learn.css"

export default function Learn() {
  const { goToStart, goToGame } = usePageTransition()

  return (
    <section className="learnContainer">
      <h1 className="learnTitle">これはLearnページです</h1>
      <div className="learnActions">
        <button type="button" className="learnButton isSecondary" onClick={goToStart}>
          スタートページへ
        </button>
        <button type="button" className="learnButton" onClick={goToGame}>
          Gameページへ
        </button>
      </div>
    </section>
  )
}
