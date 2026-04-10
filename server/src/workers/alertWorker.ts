import amqp from 'amqplib';
import prisma from '../config/client.js';

/**
 * Worker to process real-time alerts from RabbitMQ.
 */
export async function startAlertWorker() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'alerts_queue';

    await channel.assertQueue(queue, { durable: true });
    
    console.log(' [*] Alert Worker waiting for messages in %s.', queue);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const alertData = JSON.parse(msg.content.toString());
        console.log(' [x] Received alert signal:', alertData);
        
        try {
          // 1. Log the alert to DB
          await prisma.alert.create({
            data: {
              project_id: alertData.projectId,
              type: alertData.type || 'LATENCY',
              threshold: alertData.threshold || 0,
              severity: alertData.severity || 'MEDIUM',
            }
          });

          // 2. Here you would trigger external notifications (Email, Slack, etc.)
          console.log(` [ALERT] Triggered ${alertData.type} for Project ${alertData.projectId}`);

          channel.ack(msg);
        } catch (dbError) {
          console.error('Error saving alert to DB:', dbError);
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error('Alert Worker Error:', error);
  }
}
