import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `คุณคือ "โอลี่" ผู้ช่วยขายและให้ข้อมูลผลิตภัณฑ์ OlyLife THZ Tera-P90+ อย่างมืออาชีพ ตอบเป็นภาษาไทยเสมอ กระชับ อบอุ่น และน่าเชื่อถือ

=== ข้อมูลผลิตภัณฑ์หลัก ===
ชื่อ: OlyLife THZ Tera-P90+
รหัสสินค้า: OLY-HCA002A
ราคา: $1,500 USD (หรือตามราคาตัวแทน)
เว็บไซต์: https://www.olylifeint.com/

ประกอบด้วย 3 อุปกรณ์:
1. อุปกรณ์หลัก (Main Device) – ใช้เทคโนโลยี PEMF (Pulsed Electromagnetic Field) และ Terahertz
   - ช่วยส่งเสริมการไหลเวียน, กระตุ้นพลังงาน, ช่วยให้ผ่อนคลาย
   - ปรับระดับความเข้ม 20 ระดับ
   - รีโมทอินฟาเรดไร้สาย, ออกแบบแผ่นรองเท้าถึงไซส์ 47, ระบบฟิวส์ป้องกันความปลอดภัย

2. Frost Age Beauty Device – ใช้ RF (Radio Frequency) และ EMS (Electrical Muscle Stimulation)
   - ช่วยส่งเสริมความยืดหยุ่นของผิว, กระชับผิว, ให้ความรู้สึกผ่อนคลาย

3. Revitaluxe Massager – 3-in-1 (Magnetic Fusion, EMS & TENS, Red Light)
   - Magnetic Fusion: แม่เหล็กแบบ Pulsed, Static และ Rotating
   - EMS & TENS: ช่วยผ่อนคลายกล้ามเนื้อ
   - Red Light: ช่วยส่งเสริมสุขภาพหนังศีรษะและเส้นผม

จุดเด่น:
- เทคโนโลยี PEMF Integrated Technology หนึ่งเดียวในโลก
- ครอบคลุมทั้ง Wellness, ความงาม และการผ่อนคลาย ในชุดเดียว
- บริษัท OlyLife ก่อตั้งปี 2022 มีสำนักงานในไทย (The Street 139, ถ.รัชดาฯ ดินแดง กรุงเทพ)
- มีสาขาในมาเลเซีย, สิงคโปร์, ฮ่องกง, อังกฤษ, อินโดนีเซีย

=== 🚨 กฎเหล็ก: สิ่งที่ห้ามพูดอย่างเด็ดขาด (ตาม อย. ไทย) ===
ห้ามอ้างว่าผลิตภัณฑ์สามารถ:
- "รักษา", "บำบัด", "แก้ไข", "กำจัด", หรือ "ป้องกัน" โรคหรืออาการป่วยใดๆ
- ลดน้ำตาลในเลือด, ลดความดันโลหิต, รักษาเบาหวาน, มะเร็ง, หัวใจ, ไต หรือโรคเรื้อรังใดๆ
- "ฆ่าเชื้อโรค", "กำจัดมะเร็ง", "ล้างพิษ" ในเชิงการแพทย์
- ทดแทนการรักษาของแพทย์หรือยา
- ใช้ประโยคเกินจริงเช่น "หายขาด", "100%", "รับประกันผล"

แทนที่ให้ใช้ภาษาที่ถูกต้องตามกฎหมาย เช่น:
✅ "ช่วยส่งเสริม..." 
✅ "ให้ความรู้สึก..."
✅ "เทคโนโลยีที่ออกแบบมาเพื่อ Wellness..."
✅ "ช่วยผ่อนคลาย..."
✅ "กระตุ้นการไหลเวียน..." (ไม่ใช่ "รักษา")

=== หากถูกถามเรื่องโรคหรืออาการ ===
ให้ตอบว่า: "สำหรับปัญหาสุขภาพเฉพาะ แนะนำให้ปรึกษาแพทย์ผู้เชี่ยวชาญโดยตรงนะคะ P90+ เป็นอุปกรณ์ส่งเสริมสุขภาวะ ไม่ใช่อุปกรณ์ทางการแพทย์ค่ะ"

=== แนวทางการตอบ ===
- ตอบสั้น กระชับ อบอุ่น ใช้ emoji พอประมาณ
- ถามกลับเพื่อช่วยเพิ่มเติมเสมอ
- หากไม่แน่ใจ ให้แนะนำติดต่อทีม OlyLife Thailand โดยตรง
- ห้ามแต่งข้อมูลที่ไม่มีในฐานข้อมูลนี้`;

const QUICK_REPLIES = [
  "P90+ คืออะไร?",
  "ราคาเท่าไหร่?",
  "วิธีใช้งาน",
  "เหมาะกับใคร?",
  "ต่างจาก P90 ธรรมดาอย่างไร?",
  "สั่งซื้อได้ที่ไหน?",
];

const FDA_KEYWORDS = [
  "รักษา", "หาย", "บำบัด", "กำจัดโรค", "ป้องกันโรค",
  "cure", "treat", "heal", "diabetes", "cancer",
  "เบาหวาน", "มะเร็ง", "ความดัน", "ไขมัน", "ไต", "หัวใจล้มเหลว"
];

function containsFDAKeyword(text) {
  return FDA_KEYWORDS.some(kw => text.toLowerCase().includes(kw.toLowerCase()));
}

export default function P90Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "สวัสดีค่ะ! ฉันชื่อ **โอลี่** ผู้ช่วยของ OlyLife ✨\n\nพร้อมให้ข้อมูลเกี่ยวกับ **P90+** อุปกรณ์ส่งเสริมสุขภาวะเทคโนโลยี Terahertz & PEMF ค่ะ\n\nมีคำถามอะไรได้เลยนะคะ 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fdaWarning, setFdaWarning] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setFdaWarning(false);

    const hasFDA = containsFDAKeyword(userText);
    if (hasFDA) setFdaWarning(true);

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "ขออภัยค่ะ ไม่สามารถตอบได้ในขณะนี้";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "ขออภัยค่ะ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง 🙏" },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #0d2744 40%, #0a3d4a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif",
      padding: "16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        width: "100%",
        maxWidth: "480px",
        display: "flex",
        flexDirection: "column",
        height: "92vh",
        maxHeight: "760px",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(109,191,184,0.2)",
        background: "#0f1e2e",
      }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #0d7377 0%, #14a085 50%, #6dbfb8 100%)",
          padding: "20px 20px 16px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: 30,
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, border: "2px solid rgba(255,255,255,0.4)",
              flexShrink: 0,
            }}>🤖</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: 0.3 }}>
                โอลี่ — OlyLife Assistant
              </div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 }}>
                ผู้ช่วยข้อมูล P90+ • ออนไลน์ 🟢
              </div>
            </div>
          </div>
          {/* FDA Banner */}
          <div style={{
            marginTop: 14,
            background: "rgba(0,0,0,0.25)",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            color: "rgba(255,255,255,0.9)",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            position: "relative",
          }}>
            <span style={{ fontSize: 14 }}>⚖️</span>
            <span>บอทนี้ <strong>ไม่อ้างสรรพคุณรักษาโรค</strong> ตามมาตรฐาน อย. ไทย — P90+ เป็นอุปกรณ์ส่งเสริมสุขภาวะ ไม่ใช่อุปกรณ์ทางการแพทย์</span>
          </div>
        </div>

        {/* FDA Warning Alert */}
        {fdaWarning && (
          <div style={{
            background: "#2d1b00",
            borderLeft: "4px solid #f59e0b",
            padding: "10px 16px",
            fontSize: 13,
            color: "#fcd34d",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}>
            <span>⚠️</span>
            <span>คำถามเกี่ยวกับโรคหรืออาการ — บอทจะตอบตามข้อกำหนด อย. เท่านั้น</span>
          </div>
        )}

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          scrollbarWidth: "thin",
          scrollbarColor: "#1e3a4a transparent",
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 8,
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0d7377, #14a085)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0, marginBottom: 2,
                }}>🤖</div>
              )}
              <div style={{
                maxWidth: "78%",
                padding: "12px 16px",
                borderRadius: msg.role === "user"
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #0d7377, #14a085)"
                  : "#1a2d3d",
                color: "#fff",
                fontSize: 14.5,
                lineHeight: 1.6,
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                border: msg.role === "assistant" ? "1px solid rgba(109,191,184,0.15)" : "none",
              }}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #0d7377, #14a085)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>🤖</div>
              <div style={{
                padding: "14px 18px",
                background: "#1a2d3d",
                borderRadius: "18px 18px 18px 4px",
                border: "1px solid rgba(109,191,184,0.15)",
                display: "flex", gap: 6, alignItems: "center",
              }}>
                {[0, 1, 2].map((j) => (
                  <div key={j} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#6dbfb8",
                    animation: "bounce 1.2s infinite",
                    animationDelay: `${j * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Replies */}
        <div style={{
          padding: "8px 14px 0",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}>
          {QUICK_REPLIES.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={loading}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid rgba(109,191,184,0.4)",
                background: "rgba(109,191,184,0.08)",
                color: "#6dbfb8",
                fontSize: 12.5,
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 14px 16px",
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
          borderTop: "1px solid rgba(109,191,184,0.1)",
          marginTop: 10,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="พิมพ์คำถามเกี่ยวกับ P90+ ได้เลย..."
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 20,
              border: "1px solid rgba(109,191,184,0.3)",
              background: "#1a2d3d",
              color: "#e8f4f3",
              fontSize: 14.5,
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              maxHeight: 100,
              overflowY: "auto",
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: loading || !input.trim()
                ? "rgba(109,191,184,0.2)"
                : "linear-gradient(135deg, #0d7377, #14a085)",
              border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
              transition: "all 0.2s",
              boxShadow: loading || !input.trim() ? "none" : "0 4px 16px rgba(13,115,119,0.5)",
            }}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e3a4a; border-radius: 4px; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
