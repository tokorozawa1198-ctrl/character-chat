self.addEventListener("push", function (event) {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: "근떡존",
      body: event.data ? event.data.text() : "주인님?",
    };
  }

  const title = data.title || "근떡존";
  const options = {
    body: data.body || "주인님? 답이 느리시네요.",
    icon: data.icon || "/oppa1.png",
    badge: data.badge || "/oppa1.png",
    tag: data.tag || "geuntteokjon-push",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }

      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});