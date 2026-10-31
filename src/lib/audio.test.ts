import { describe, it, expect } from "vitest";
import {
  cleanSpeechSegment,
  prepareSpokenSegments,
  prepareSpokenText,
} from "./audio";

describe("cleanSpeechSegment - Làm sạch phân đoạn từ vựng loại bỏ hoàn toàn dấu", () => {
  it("loại bỏ các chú thích từ loại trong ngoặc đơn và ngoặc vuông", () => {
    expect(cleanSpeechSegment("record (n/v)")).toBe("record");
    expect(cleanSpeechSegment("duplicate (v/n/adj)")).toBe("duplicate");
    expect(cleanSpeechSegment("[n] record")).toBe("record");
    expect(cleanSpeechSegment("[v] present")).toBe("present");
  });

  it("loại bỏ các ký hiệu từ loại đứng rời như n., v., adj., adv., n,v.", () => {
    expect(cleanSpeechSegment("lease n,v.")).toBe("lease");
    expect(cleanSpeechSegment("mix n,v.")).toBe("mix");
    expect(cleanSpeechSegment("follow up v, n.")).toBe("follow up");
  });

  it("bảo tồn các từ ghép có gạch nối và nháy đơn hợp lệ", () => {
    expect(cleanSpeechSegment("cost-cutting")).toBe("cost-cutting");
    expect(cleanSpeechSegment("don't")).toBe("don't");
    expect(cleanSpeechSegment("it's")).toBe("it's");
  });
});

describe("prepareSpokenSegments - Bóc tách từ vựng thành các phân đoạn sạch 100% không vướng dấu", () => {
  it("tách cặp từ phân cách bằng dấu gạch chéo thành các từ độc lập, không vướng dấu slash hay comma", () => {
    expect(prepareSpokenSegments("historic / historical")).toEqual([
      "historic",
      "historical",
    ]);
    expect(prepareSpokenSegments("affect / effect")).toEqual([
      "affect",
      "effect",
    ]);
    expect(prepareSpokenSegments("sensible / sensitive")).toEqual([
      "sensible",
      "sensitive",
    ]);
    expect(prepareSpokenSegments("access / excess")).toEqual([
      "access",
      "excess",
    ]);
    expect(prepareSpokenSegments("advice / advise")).toEqual([
      "advice",
      "advise",
    ]);
  });

  it("xử lý trường hợp không có khoảng trắng quanh dấu gạch chéo hoặc nhiều dấu", () => {
    expect(prepareSpokenSegments("historic/historical")).toEqual([
      "historic",
      "historical",
    ]);
    expect(prepareSpokenSegments("one / two / three")).toEqual([
      "one",
      "two",
      "three",
    ]);
    expect(prepareSpokenSegments("historic // historical")).toEqual([
      "historic",
      "historical",
    ]);
    expect(prepareSpokenSegments("/historic/")).toEqual(["historic"]);
    expect(prepareSpokenSegments("\\historic\\")).toEqual(["historic"]);
  });

  it("chuyển đổi từ viết tắt kỹ thuật như A/B testing thành từ sạch và tách pub/sub", () => {
    expect(prepareSpokenSegments("A/B testing")).toEqual(["A B testing"]);
    expect(prepareSpokenSegments("pub/sub")).toEqual(["pub", "sub"]);
  });

  it("xử lý các từ đa từ loại có kèm chú thích (n/v), (v/n), n,v. hoặc [n]...[v]", () => {
    expect(prepareSpokenSegments("record (n/v)")).toEqual(["record"]);
    expect(prepareSpokenSegments("duplicate (v/n/adj)")).toEqual(["duplicate"]);
    expect(prepareSpokenSegments("[n] record · [v] record")).toEqual(["record"]);
    expect(prepareSpokenSegments("lease, n,v.")).toEqual(["lease"]);
    expect(prepareSpokenSegments("mix (n,v.)")).toEqual(["mix"]);
  });

  it("xử lý phân biệt trọng âm Noun vs Verb qua Syllable-Stress Respelling mà không có từ 'to' hay 'di'", () => {
    // Với từ heteronym 'contract'
    expect(prepareSpokenSegments("contract", "noun")).toEqual(["CON-tract"]);
    expect(prepareSpokenSegments("contract", "verb")).toEqual(["con-TRACT"]);

    // Với từ 'record', 'conduct', 'present'
    expect(prepareSpokenSegments("record", "noun")).toEqual(["RE-cord"]);
    expect(prepareSpokenSegments("record", "verb")).toEqual(["re-CORD"]);
    expect(prepareSpokenSegments("conduct", "noun")).toEqual(["CON-duct"]);
    expect(prepareSpokenSegments("conduct", "verb")).toEqual(["con-DUCT"]);
    expect(prepareSpokenSegments("present", "noun")).toEqual(["PRE-sent"]);
    expect(prepareSpokenSegments("present", "verb")).toEqual(["pre-SENT"]);

    // Từ thông thường không nằm trong heteronym map sẽ được giữ nguyên sạch sẽ, KHÔNG tự ý chèn 'to '
    expect(prepareSpokenSegments("rise / raise", "verb")).toEqual([
      "rise",
      "raise",
    ]);
  });

  it("trả về mảng rỗng nếu đầu vào rỗng hoặc chỉ toàn ký tự rác", () => {
    expect(prepareSpokenSegments("")).toEqual([]);
    expect(prepareSpokenSegments("   ")).toEqual([]);
    expect(prepareSpokenSegments(" / ")).toEqual([]);
    expect(prepareSpokenSegments("///")).toEqual([]);
  });
});

describe("prepareSpokenText - Định dạng văn bản phát âm chuẩn sư phạm", () => {
  it("dùng dấu chấm câu '. ' giữa các câu thay vì dấu phẩy để triệt tiêu việc đọc chữ comma", () => {
    expect(prepareSpokenText("historic / historical")).toBe(
      "historic. historical"
    );
    expect(prepareSpokenText("affect / effect")).toBe("affect. effect");
    expect(prepareSpokenText("sensible / sensitive")).toBe(
      "sensible. sensitive"
    );
  });

  it("giữ nguyên từ hoặc cụm từ thông thường", () => {
    expect(prepareSpokenText("historic")).toBe("historic");
    expect(prepareSpokenText("touch base")).toBe("touch base");
  });
});
