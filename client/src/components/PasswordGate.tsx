import { FormEvent, useState } from "react";
import { LemonSprite } from "./GameSprites";
import "./password-gate.css";

const PASSWORD = "limondrakofuzz";
const ACCESS_KEY = "limonero-access-granted";

function hasAccess() {
  try {
    return sessionStorage.getItem(ACCESS_KEY) === "true";
  } catch {
    return false;
  }
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(hasAccess);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== PASSWORD) {
      setError(true);
      setPassword("");
      return;
    }
    try {
      sessionStorage.setItem(ACCESS_KEY, "true");
    } catch {
      // The access gate still works for this tab when storage is unavailable.
    }
    setError(false);
    setUnlocked(true);
  }

  if (unlocked) return <>{children}</>;

  return (
    <main className="password-gate">
      <section className="password-gate-card" aria-labelledby="password-gate-title">
        <div className="password-gate-lemon"><LemonSprite /></div>
        <span className="password-gate-kicker">LIMONERO FUZZ · ACCESO</span>
        <h1 id="password-gate-title">El viaje está esperando</h1>
        <p>Introduce la contraseña para entrar en el explorador de pantallas.</p>
        <form onSubmit={submit}>
          <label htmlFor="game-password">Contraseña</label>
          <input
            id="game-password"
            type="password"
            inputMode="text"
            autoCapitalize="none"
            spellCheck={false}
            autoComplete="off"
            value={password}
            onChange={event => { setPassword(event.target.value); setError(false); }}
            autoFocus
          />
          <button type="submit">entrar al juego</button>
        </form>
        {error && <p className="password-gate-error" role="alert">La contraseña no abre este portal.</p>}
        <small>Acceso informal para esta demo. No sustituye una protección de servidor.</small>
      </section>
    </main>
  );
}
