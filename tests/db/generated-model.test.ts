import { describe, it, expect, afterEach } from "vitest";
import { prisma } from "../../src/lib/db";

describe("GeneratedModel", () => {

  it("создаёт запись карточки модели", async () => {
    const data = {
      name: "Тестовая модель",
      fileUrl: "https://example.com/model.glb",
    };

    const created = await prisma.generatedModel.create({
      data,
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe(data.name);
    expect(created.fileUrl).toBe(data.fileUrl);
    expect(created.createdAt).toBeInstanceOf(Date);

    const found = await prisma.generatedModel.findUnique({
      where: { id: created.id },
    });
    expect(found).not.toBeNull();
    expect(found?.name).toBe(data.name);
  });
});
