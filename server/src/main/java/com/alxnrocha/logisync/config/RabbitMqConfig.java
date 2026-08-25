package com.alxnrocha.logisync.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMqConfig {

    public static final String EXCHANGE_NAME = "supplychain.exchange";
    public static final String DLX_EXCHANGE_NAME = "supplychain.dlx";

    public static final String QUEUE_ORDERS = "supplychain.orders.queue";
    public static final String QUEUE_INVENTORY = "supplychain.inventory.queue";
    public static final String QUEUE_DISPATCH = "supplychain.dispatch.queue";
    public static final String QUEUE_TELEMETRY = "supplychain.telemetry.queue";
    public static final String QUEUE_DLQ = "supplychain.dlq";

    public static final String ROUTING_ORDERS = "supplychain.orders.#";
    public static final String ROUTING_INVENTORY = "supplychain.inventory.#";
    public static final String ROUTING_DISPATCH = "supplychain.events.dispatch";
    public static final String ROUTING_TELEMETRY = "logistics.telemetry.#";

    @Bean
    public TopicExchange supplyChainExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public TopicExchange deadLetterExchange() {
        return new TopicExchange(DLX_EXCHANGE_NAME, true, false);
    }

    private Map<String, Object> deadLetterArguments() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-dead-letter-exchange", DLX_EXCHANGE_NAME);
        args.put("x-dead-letter-routing-key", "dlq.routing");
        return args;
    }

    @Bean
    public Queue ordersQueue() {
        return new Queue(QUEUE_ORDERS, true, false, false, deadLetterArguments());
    }

    @Bean
    public Queue inventoryQueue() {
        return new Queue(QUEUE_INVENTORY, true, false, false, deadLetterArguments());
    }

    @Bean
    public Queue dispatchQueue() {
        return new Queue(QUEUE_DISPATCH, true, false, false, deadLetterArguments());
    }

    @Bean
    public Queue telemetryQueue() {
        return new Queue(QUEUE_TELEMETRY, true, false, false, deadLetterArguments());
    }

    @Bean
    public Queue deadLetterQueue() {
        return new Queue(QUEUE_DLQ, true);
    }

    @Bean
    public Binding ordersBinding(Queue ordersQueue, TopicExchange supplyChainExchange) {
        return BindingBuilder.bind(ordersQueue).to(supplyChainExchange).with(ROUTING_ORDERS);
    }

    @Bean
    public Binding inventoryBinding(Queue inventoryQueue, TopicExchange supplyChainExchange) {
        return BindingBuilder.bind(inventoryQueue).to(supplyChainExchange).with(ROUTING_INVENTORY);
    }

    @Bean
    public Binding dispatchBinding(Queue dispatchQueue, TopicExchange supplyChainExchange) {
        return BindingBuilder.bind(dispatchQueue).to(supplyChainExchange).with(ROUTING_DISPATCH);
    }

    @Bean
    public Binding telemetryBinding(Queue telemetryQueue, TopicExchange supplyChainExchange) {
        return BindingBuilder.bind(telemetryQueue).to(supplyChainExchange).with(ROUTING_TELEMETRY);
    }

    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange).with("#");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        template.setMandatory(true);
        return template;
    }
}
