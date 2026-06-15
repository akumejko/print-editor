"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  onClose: () => void;
}

export function TermsModal({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Regulamin przesyłania plików</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Zamknij"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 text-sm text-slate-700 space-y-4">
          <section>
            <h3 className="font-semibold text-slate-800 mb-2">1. Oświadczenia Użytkownika</h3>
            <p className="mb-2">Przesyłając pliki do Serwisu, Użytkownik oświadcza i gwarantuje, że:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Posiada pełne prawa autorskie lub odpowiednie licencje/zgody do wszystkich przesyłanych materiałów, w tym w szczególności do zamieszczonych zdjęć.</li>
              <li>Zamieszczone materiały nie naruszają praw osób trzecich, w tym dóbr osobistych, praw autorskich, ani przepisów prawa powszechnie obowiązującego.</li>
              <li>W przypadku, gdy na przesłanych plikach znajduje się wizerunek osób trzecich, Użytkownik uzyskał wymagane prawem zgody na ich rozpowszechnianie w Serwisie.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-2">2. Licencja</h3>
            <p className="text-slate-600">Przesyłając pliki, Użytkownik udziela Właścicielowi Serwisu nieodpłatnej, niewyłącznej licencji na przechowywanie i wyświetlanie tych plików w celu świadczenia usługi, przez czas niezbędny do jej realizacji zgodnie z niniejszym regulaminem.</p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-2">3. Polityka przechowywania plików</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Wszystkie pliki przesłane do Serwisu są przechowywane na serwerach przez okres 7 (siedmiu) dni kalendarzowych.</li>
              <li>Po upływie wyżej wymienionego terminu, pliki są automatycznie i trwale usuwane z zasobów Serwisu.</li>
              <li>Właściciel Serwisu nie tworzy kopii zapasowych plików użytkowników po upływie wskazanego okresu przechowywania. Użytkownik jest zobowiązany do zachowania kopii swoich plików we własnym zakresie.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-2">4. Wyłączenie odpowiedzialności</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Właściciel Serwisu nie kontroluje zawartości plików przesyłanych przez Użytkowników przed ich udostępnieniem.</li>
              <li>Właściciel Serwisu nie ponosi odpowiedzialności za treść plików, ich zgodność z prawem, ani za ewentualne naruszenia praw osób trzecich wynikające z ich publikacji przez Użytkownika.</li>
              <li>Użytkownik przyjmuje do wiadomości, że w przypadku stwierdzenia naruszenia prawa lub regulaminu, Właściciel Serwisu jest uprawniony do niezwłocznego usunięcia pliku oraz zablokowania dostępu Użytkownikowi, bez uprzedniego powiadomienia.</li>
              <li>Użytkownik zobowiązuje się do zwolnienia Właściciela Serwisu z wszelkiej odpowiedzialności w przypadku roszczeń osób trzecich skierowanych przeciwko Właścicielowi, a wynikających z działań Użytkownika.</li>
            </ul>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
