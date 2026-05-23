import {
  createInitialState,
  shouldShowResolve,
  type AppState,
} from "./state";
import { SakuraCanvas } from "../components/SakuraCanvas";
import { mountSoundControl } from "../components/SoundControl";
import {
  bindDrawPage,
  cleanupDrawPage,
  renderDrawPage,
  addShakeToPot,
} from "../pages/DrawPage";
import { bindGatePage, renderGatePage } from "../pages/GatePage";
import { bindPurifyPage, renderPurifyPage } from "../pages/PurifyPage";
import { bindResultPage, renderResultPage } from "../pages/ResultPage";
import { bindWishPage, renderWishPage } from "../pages/WishPage";
import { bindStatsPage, renderStatsPage } from "../pages/StatsPage";
import { bindAtlasPage, renderAtlasPage } from "../pages/AtlasPage";
import { bindDuoPage, renderDuoPage } from "../pages/DuoPage";
import { drawBySignType, findOmikujiById } from "../services/fortune";
import { getDailyFortune } from "../services/daily";
import { applySeasonTheme, applyTimeOfDayTheme } from "../services/season";
import { initSound } from "../services/sound";
import {
  appendRecord,
  loadRecords,
  markPurified,
} from "../services/storage";
import { getCollections, toggleCollection } from "../services/db";
import {
  evaluateAchievements,
  buildAchievementContext,
} from "../services/achievements";
import { getUnlockedAchievements } from "../services/db";
import { parsePermalinkFortuneId } from "../services/share";
import type { DrawMethod, SignType } from "../types/record";
import type { Omikuji } from "../contents";

export class App {
  private root: HTMLElement;
  private state: AppState;
  private ready = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = createInitialState([]);
  }

  async start(): Promise<void> {
    initSound();
    applySeasonTheme();
    void applyTimeOfDayTheme();

    const [records, collections] = await Promise.all([
      loadRecords(),
      getCollections(),
    ]);
    this.state = createInitialState(records, collections);
    this.ready = true;

    const appContainer = document.body;
    if (!document.querySelector(".sakura-canvas")) {
      new SakuraCanvas(appContainer);
    }
    mountSoundControl(appContainer);

    const permalinkId = parsePermalinkFortuneId();
    if (permalinkId) {
      const omikuji = findOmikujiById(permalinkId);
      if (omikuji) {
        this.setState({
          view: "pilgrimage",
          step: "reveal",
          currentFortune: omikuji,
          skipRitual: true,
        });
      }
    }

    this.render();
  }

  private setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
  }

  private async resolvePendingFortune(): Promise<Omikuji | null> {
    if (this.state.signType === "daily") {
      return getDailyFortune();
    }
    return drawBySignType(
      this.state.signType,
      this.state.wish,
      this.state.specifiedId ?? undefined,
    );
  }

  private async prepareDrawPhase(): Promise<void> {
    const fortune = await this.resolvePendingFortune();
    if (!fortune) return;

    this.setState({
      pendingFortune: fortune,
      highlightedDrawer: (fortune.id - 1) % 9,
      drawPhase: "shake",
    });
  }

  private render(): void {
    if (!this.ready) {
      this.root.innerHTML =
        '<main class="app-shell"><p class="subtitle">正在入寺…</p></main>';
      return;
    }

    cleanupDrawPage();

    if (this.state.view === "stats") {
      this.renderStats();
      return;
    }
    if (this.state.view === "atlas") {
      void this.renderAtlas();
      return;
    }
    if (this.state.view === "duo") {
      this.renderDuo();
      return;
    }

    switch (this.state.step) {
      case "gate":
        this.renderGate();
        break;
      case "purify":
        this.renderPurify();
        break;
      case "wish":
        this.renderWish();
        break;
      case "draw":
        this.renderDraw();
        break;
      case "reveal":
      case "resolve":
        this.renderResult();
        break;
      default:
        this.renderGate();
    }
  }

  private renderGate(): void {
    this.root.innerHTML = renderGatePage();
    bindGatePage(
      this.root,
      () => {
        this.setState({ view: "pilgrimage", step: "purify", skipRitual: false });
        this.render();
      },
      () => {
        void this.startQuickDraw();
      },
      () => {
        this.setState({ view: "stats" });
        this.render();
      },
      () => {
        this.setState({ view: "atlas" });
        this.render();
      },
      () => {
        this.setState({ view: "duo" });
        this.render();
      },
    );
  }

  private async startQuickDraw(): Promise<void> {
    await this.prepareDrawPhase();
    this.setState({
      view: "pilgrimage",
      step: "draw",
      skipRitual: true,
      method: "touch",
    });
    this.render();
  }

  private renderPurify(): void {
    this.root.innerHTML = renderPurifyPage();
    bindPurifyPage(
      this.root,
      () => {
        this.setState({ step: "wish" });
        this.render();
      },
      () => {
        this.setState({ step: "wish" });
        this.render();
      },
    );
  }

  private renderWish(): void {
    this.root.innerHTML = renderWishPage(this.state.signType);
    bindWishPage(
      this.root,
      (signType, wish, specifiedId) => {
        void this.goToDraw(signType, wish, specifiedId);
      },
      () => {
        void this.goToDraw(this.state.signType, "", this.state.specifiedId);
      },
    );
  }

  private async goToDraw(
    signType: SignType,
    wish: string,
    specifiedId: number | null,
  ): Promise<void> {
    this.setState({
      signType,
      wish,
      specifiedId,
      method: this.state.method ?? "touch",
    });
    await this.prepareDrawPhase();
    this.setState({ step: "draw" });
    this.render();
  }

  private renderDraw(): void {
    const method = this.state.method ?? "touch";
    const fortune = this.state.pendingFortune;

    if (!fortune) {
      void this.prepareDrawPhase().then(() => this.render());
      return;
    }

    this.root.innerHTML = renderDrawPage(
      method,
      this.state.drawPhase,
      this.state.highlightedDrawer,
    );

    bindDrawPage(
      this.root,
      method,
      this.state.drawPhase,
      this.state.highlightedDrawer,
      {
        fortuneIdForShake: fortune.id,
        onShakeReady: () => {
          this.setState({ drawPhase: "drawer" });
          this.render();
        },
        onSkipShake: () => {
          this.setState({ drawPhase: "drawer" });
          this.render();
        },
        onExternalShake: (power) => addShakeToPot(power),
        onSelect: () => void this.completeDraw(method),
        onBack: () => {
          if (this.state.skipRitual) {
            this.setState({ step: "gate", pendingFortune: null });
          } else {
            this.setState({ step: "wish", pendingFortune: null });
          }
          this.render();
        },
        onMethodChange: (m) => {
          this.setState({ method: m });
          this.render();
        },
      },
    );
  }

  private async completeDraw(method: DrawMethod): Promise<void> {
    cleanupDrawPage();

    const fortune = this.state.pendingFortune ?? (await this.resolvePendingFortune());
    if (!fortune) return;

    const records = await appendRecord(this.state.records, fortune, {
      signType: this.state.signType,
      method,
      wish: this.state.wish || undefined,
    });

    const collections = await getCollections();
    const ctx = buildAchievementContext(records, collections);
    await evaluateAchievements(ctx);

    const latest = records[0];

    this.setState({
      records,
      collections,
      currentFortune: fortune,
      currentRecordId: latest?.id ?? null,
      pendingFortune: null,
      step: "reveal",
      method,
    });
    this.render();
  }

  private renderResult(): void {
    const fortune = this.state.currentFortune;
    if (!fortune) {
      this.setState({ step: "gate" });
      this.render();
      return;
    }

    const showResolve = shouldShowResolve(this.state);
    this.root.innerHTML = renderResultPage(
      fortune,
      showResolve,
      this.state.step === "resolve" ? "resolve" : "reveal",
      this.state.collections.includes(fortune.id),
    );

    bindResultPage(this.root, this.state, {
      onPurified: () => {
        void this.handlePurified(fortune);
      },
      onDrawAgain: () => {
        void this.prepareDrawPhase().then(() => {
          this.setState({ step: "draw" });
          this.render();
        });
      },
      onBackGate: () => {
        this.setState({
          view: "pilgrimage",
          step: "gate",
          currentFortune: null,
          currentRecordId: null,
          pendingFortune: null,
        });
        this.render();
      },
      onGoResolve: () => {
        this.setState({ step: "resolve" });
        this.render();
      },
      onHistorySelect: () => {},
      onToggleCollect: () => {
        void this.handleToggleCollect(fortune.id);
      },
      onShare: (template) => {
        void import("../services/share").then(({ generateShareCard, downloadCanvas }) =>
          generateShareCard(fortune, template).then((c) =>
            downloadCanvas(c, `omikuji-${fortune.id}.png`),
          ),
        );
      },
      onCopyText: () => {
        void import("../services/share").then(({ copyFortuneText }) =>
          copyFortuneText(fortune),
        );
      },
    });
  }

  private async handlePurified(fortune: Omikuji): Promise<void> {
    if (this.state.currentRecordId) {
      const records = await markPurified(
        this.state.records,
        this.state.currentRecordId,
      );
      this.setState({ records, step: "exit" });
    }
    this.renderExit(fortune);
  }

  private async handleToggleCollect(fortuneId: number): Promise<void> {
    await toggleCollection(fortuneId);
    const collections = await getCollections();
    this.setState({ collections });
    this.render();
  }

  private renderExit(fortune: Omikuji): void {
    this.root.innerHTML = `
      <main class="app-shell exit-shell">
        <header class="app-header">
          <h1>离寺</h1>
          <p class="subtitle">愿此签文伴您顺遂</p>
        </header>
        <p class="exit-message">您已完成系签解厄。第${fortune.id}签的厄运已留在数字寺中。</p>
        <section class="gate-actions">
          <button id="exit-home" class="primary-button" type="button">返回山门</button>
          <button id="exit-draw" class="secondary-button" type="button">再抽一签</button>
        </section>
      </main>
    `;

    this.root.querySelector("#exit-home")?.addEventListener("click", () => {
      this.setState({
        view: "pilgrimage",
        step: "gate",
        currentFortune: null,
        currentRecordId: null,
      });
      this.render();
    });

    this.root.querySelector("#exit-draw")?.addEventListener("click", () => {
      void this.prepareDrawPhase().then(() => {
        this.setState({ step: "draw" });
        this.render();
      });
    });
  }

  private renderStats(): void {
    this.root.innerHTML = renderStatsPage(this.state.records);
    bindStatsPage(this.root, () => {
      this.setState({ view: "pilgrimage", step: "gate" });
      this.render();
    });
  }

  private async renderAtlas(): Promise<void> {
    const unlocked = await getUnlockedAchievements();
    this.root.innerHTML = renderAtlasPage(
      this.state.records,
      this.state.collections,
      unlocked,
    );
    bindAtlasPage(
      this.root,
      () => {
        this.setState({ view: "pilgrimage", step: "gate" });
        this.render();
      },
      (id) => {
        const omikuji = findOmikujiById(id);
        if (omikuji) {
          this.setState({
            view: "pilgrimage",
            step: "reveal",
            currentFortune: omikuji,
            skipRitual: true,
          });
          this.render();
        }
      },
    );
  }

  private renderDuo(): void {
    this.root.innerHTML = renderDuoPage();
    bindDuoPage(this.root, () => {
      this.setState({ view: "pilgrimage", step: "gate" });
      this.render();
    });
  }
}
