import { describe, it, expect } from "vitest";
import { prepareSpokenText } from "./audio";

describe("prepareSpokenText - Chuẩn hóa văn bản trước khi phát âm Web Speech API", () => {
  it("chuyển dấu gạch chéo thành dấu phẩy và khoảng trắng để ngắt nghỉ tự nhiên, không đọc chữ slash", () => {
    expect(prepareSpokenText("historic / historical")).toBe("historic, historical");
    expect(prepareSpokenText("affect / effect")).toBe("affect, effect");
    expect(prepareSpokenText("sensible / sensitive")).toBe("sensible, sensitive");
  });

  it("xử lý trường hợp không có khoảng trắng quanh dấu gạch chéo", () => {
    expect(prepareSpokenText("historic/historical")).toBe("historic, historical");
    expect(prepareSpokenText("pub/sub")).toBe("pub, sub");
    expect(prepareSpokenText("A/B testing")).toBe("A, B testing");
  });

  it("xử lý nhiều phân đoạn gạch chéo hoặc dấu gạch chéo lặp lại", () => {
    expect(prepareSpokenText("one / two / three")).toBe("one, two, three");
    expect(prepareSpokenText("historic // historical")).toBe("historic, historical");
  });

  it("loại bỏ dấu gạch chéo hoặc gạch chéo ngược ở đầu và cuối chuỗi", () => {
    expect(prepareSpokenText("/historic/")).toBe("historic");
    expect(prepareSpokenText("//historic / historical//")).toBe("historic, historical");
    expect(prepareSpokenText("\\historic\\")).toBe("historic");
  });

  it("xử lý dấu gạch chéo ngược (backslash)", () => {
    expect(prepareSpokenText("historic \\ historical")).toBe("historic, historical");
  });

  it("giữ nguyên từ hoặc cụm từ thông thường", () => {
    expect(prepareSpokenText("historic")).toBe("historic");
    expect(prepareSpokenText("touch base")).toBe("touch base");
  });

  it("xử lý posHint === 'verb' bằng cách thêm 'to ' cho từng động từ", () => {
    expect(prepareSpokenText("rise / raise", "verb")).toBe("to rise, to raise");
    expect(prepareSpokenText("conduct", "verb")).toBe("to conduct");
    expect(prepareSpokenText("to record", "verb")).toBe("to record");
  });

  it("trả về chuỗi rỗng nếu đầu vào rỗng hoặc chỉ toàn dấu gạch chéo", () => {
    expect(prepareSpokenText("")).toBe("");
    expect(prepareSpokenText("   ")).toBe("");
    expect(prepareSpokenText(" / ")).toBe("");
    expect(prepareSpokenText("///")).toBe("");
  });
});
