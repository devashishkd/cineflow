import { createLogger, format, transports } from 'winston';

/**
 * Structured Logger — Winston
 *
 * Outputs JSON in production so log aggregators (Datadog, CloudWatch, etc.)
 * can parse fields directly. Uses pretty-print in development for readability.
 *
 * Every log entry includes:
 *   - level: info | warn | error
 *   - timestamp: ISO 8601
 *   - message: human-readable description
 *   - [requestId]: UUID stamped by requestId.middleware.js (when available)
 *   - [meta]: any extra context passed by the caller
 *
 * Interview: Why structured JSON logs?
 * Plain console.log produces unstructured text. In a production system with
 * thousands of requests per second, you need to query logs by field:
 *   "Show me all errors for requestId=abc" or "Show me all 500s in the last hour"
 * JSON logs make this trivial with any log aggregation tool.
 *
 * Interview: Why not console.log?
 * - No log levels (can't silence INFO in prod)
 * - No timestamps
 * - No structured fields
 * - No transport configuration (file, remote, etc.)
 */

const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isProduction
    ? format.combine(format.timestamp(), format.errors({ stack: true }), format.json())
    : format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ level, message, timestamp, requestId, ...meta }) => {
          const rid = requestId ? ` [${requestId.slice(0, 8)}]` : '';
          const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp}${rid} ${level}: ${message}${extras}`;
        })
      ),
  transports: [new transports.Console()],
});

export default logger;
