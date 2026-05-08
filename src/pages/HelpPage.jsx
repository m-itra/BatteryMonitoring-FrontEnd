function HelpPage() {
  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Справка</span>
          <h1>Устройство не поддерживается</h1>
        </div>
      </header>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Что это значит</h2>
          </div>
        </div>
        <div className="help-copy">
          <p>
            Некоторые ноутбуки не отдают операционной системе все параметры батареи. Из-за этого
            невозможно рассчитать параметры батареи. Частая причина - в BIOS или UEFI отключён
            параметр отображения оставшегося времени работы батареи.
          </p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Что проверить</h2>
          </div>
        </div>
        <ol className="help-steps">
          <li>Перезагрузите устройство и войдите в BIOS/UEFI.</li>
          <li>Откройте раздел Configuration.</li>
          <li>
            Найдите параметр с названием вроде Battery Remaining Time, Battery Time, Remaining
            Battery Time или аналогичным.
          </li>
          <li>Включите этот параметр, сохраните настройки и загрузите систему заново.</li>
          <li>После загрузки попробуйте запустить программу мониторинга.</li>
        </ol>
      </section>
    </section>
  );
}

export default HelpPage;
