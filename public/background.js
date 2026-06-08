let dashboardWindowId = null;

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-dashboard") {
    if (dashboardWindowId !== null) {
      // 既に開いている場合は閉じて入力状態をそのままにする
      chrome.windows.remove(dashboardWindowId, () => {
        dashboardWindowId = null;
      });
    } else {
      // 固定化される「大きめのポップアップ」として新規ウィンドウで開く
      chrome.windows.create(
        {
          url: "index.html",
          type: "popup",
          width: 1200,
          height: 800,
          focused: true,
        },
        (window) => {
          dashboardWindowId = window.id;
        },
      );
    }
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === dashboardWindowId) {
    dashboardWindowId = null; // 手動で閉じられた場合のリセット
  }
});
