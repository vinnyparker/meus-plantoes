/**
 * Serviço para exportar eventos em formato .ics (iCalendar)
 * Compatível com Google Calendar, Outlook, Apple Calendar, etc.
 */

import { ScheduleEvent, Schedule } from "@/lib/types/schedule";

export class IcsExporter {
  /**
   * Formata uma data para o padrão iCalendar (YYYYMMDDTHHMMSSZ)
   */
  private static formatDate(date: Date, time: string): string {
    const d = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    d.setHours(hours, minutes, 0, 0);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}T${h}${m}${s}`;
  }

  /**
   * Escapa caracteres especiais para iCalendar
   */
  private static escapeText(text: string): string {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n");
  }

  /**
   * Gera um UUID único para o evento
   */
  private static generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Cria um evento iCalendar a partir de um ScheduleEvent
   */
  private static createIcsEvent(event: ScheduleEvent, location?: string): string {
    const uid = this.generateUUID();
    const dtstamp = this.formatDate(new Date(), "00:00");
    const dtstart = this.formatDate(event.date, event.startTime);
    const dtend = this.formatDate(event.date, event.endTime);

    const title = this.escapeText(event.title);
    const description = this.escapeText(event.description);
    const loc = location ? this.escapeText(location) : "";

    let icsEvent = `BEGIN:VEVENT\r\n`;
    icsEvent += `UID:${uid}\r\n`;
    icsEvent += `DTSTAMP:${dtstamp}Z\r\n`;
    icsEvent += `DTSTART:${dtstart}\r\n`;
    icsEvent += `DTEND:${dtend}\r\n`;
    icsEvent += `SUMMARY:${title}\r\n`;
    icsEvent += `DESCRIPTION:${description}\r\n`;

    if (loc) {
      icsEvent += `LOCATION:${loc}\r\n`;
    }

    icsEvent += `STATUS:CONFIRMED\r\n`;
    icsEvent += `SEQUENCE:0\r\n`;
    icsEvent += `END:VEVENT\r\n`;

    return icsEvent;
  }

  /**
   * Exporta uma escala completa para formato .ics
   */
  static exportSchedule(schedule: Schedule): string {
    const now = new Date();
    const dtstamp = this.formatDate(now, "00:00");

    let ics = `BEGIN:VCALENDAR\r\n`;
    ics += `VERSION:2.0\r\n`;
    ics += `PRODID:-//Meus Plantões//Portal da Enfermagem//PT-BR\r\n`;
    ics += `CALSCALE:GREGORIAN\r\n`;
    ics += `METHOD:PUBLISH\r\n`;
    ics += `X-WR-CALNAME:${this.escapeText(schedule.name)}\r\n`;
    ics += `X-WR-TIMEZONE:America/Bahia\r\n`;
    ics += `X-WR-CALDESC:Escala de plantões - ${this.escapeText(schedule.name)}\r\n`;
    ics += `DTSTAMP:${dtstamp}Z\r\n`;

    // Adicionar cada evento
    for (const event of schedule.events) {
      ics += this.createIcsEvent(event, schedule.location);
    }

    ics += `END:VCALENDAR\r\n`;

    return ics;
  }

  /**
   * Exporta um único evento para formato .ics
   */
  static exportEvent(event: ScheduleEvent, location?: string): string {
    const now = new Date();
    const dtstamp = this.formatDate(now, "00:00");

    let ics = `BEGIN:VCALENDAR\r\n`;
    ics += `VERSION:2.0\r\n`;
    ics += `PRODID:-//Meus Plantões//Portal da Enfermagem//PT-BR\r\n`;
    ics += `CALSCALE:GREGORIAN\r\n`;
    ics += `METHOD:PUBLISH\r\n`;
    ics += `X-WR-TIMEZONE:America/Bahia\r\n`;
    ics += `DTSTAMP:${dtstamp}Z\r\n`;

    ics += this.createIcsEvent(event, location);

    ics += `END:VCALENDAR\r\n`;

    return ics;
  }

  /**
   * Gera um blob para download do arquivo .ics
   */
  static generateBlob(icsContent: string): Blob {
    return new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  }

  /**
   * Gera um nome de arquivo com timestamp
   */
  static generateFilename(scheduleName: string): string {
    const now = new Date();
    const timestamp = now.toISOString().split("T")[0];
    const sanitized = scheduleName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    return `escala_${sanitized}_${timestamp}.ics`;
  }
}
