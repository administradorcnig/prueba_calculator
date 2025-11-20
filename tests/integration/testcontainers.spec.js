const { GenericContainer } = require("testcontainers");
const assert = require("assert");

describe("Demo Testcontainers", function () {
  this.timeout(60000); // damos tiempo a que arranque el contenedor

  it("levanta un Redis y da un puerto mapeado", async () => {
    const container = await new GenericContainer("redis")
      .withExposedPorts(6379)
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(6379);

    // comprobaciones básicas
    assert.ok(host);
    assert.ok(port > 0);

    await container.stop();
  });
});
