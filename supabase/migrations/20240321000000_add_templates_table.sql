create table templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null check (type in ('print', 'pdf')),
  content text not null,
  styles text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table templates enable row level security;

create policy "Templates are viewable by authenticated users"
  on templates for select
  to authenticated
  using (true);

create policy "Templates are editable by authenticated users"
  on templates for insert
  to authenticated
  with check (true);

create policy "Templates are updatable by authenticated users"
  on templates for update
  to authenticated
  using (true);

-- Insert default templates
INSERT INTO templates (name, type, content, styles) 
VALUES (
  'Default Print Template',
  'print',
  '<html><head><title>Pedido #{order_number}</title><style>{styles}</style></head><body><h2>Pedido #{order_number}</h2><div class="order-info"><p><strong>Data do Pedido:</strong> {order_date}</p><p><strong>Criado por:</strong> {created_by}</p></div><p><strong>Cliente:</strong> {customer_name}</p><p><strong>Data de Entrega:</strong> {delivery_date}</p><table><thead><tr><th>Produto</th><th>Quantidade</th><th>Dimensões</th><th>Opções Extras</th><th>Subtotal</th></tr></thead><tbody>{items}</tbody></table><div class="total">{discount}{additional_value}<p>Valor Total: R$ {total_amount}</p><p>Valor Pago: R$ {paid_amount} {payment_option}</p><p>Saldo Restante: R$ {remaining_balance}</p></div></body></html>',
  'body { font-family: Arial, sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; margin: 20px 0; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f5f5f5; } .total { font-weight: bold; margin-top: 20px; } .discount-info { margin-top: 10px; color: #666; } .description { font-style: italic; color: #666; margin-top: 4px; } .order-info { margin-bottom: 20px; color: #666; }'
);

INSERT INTO templates (name, type, content, styles) 
VALUES (
  'Default PDF Template',
  'pdf',
  '<html><head><title>Pedido #{order_number}</title><style>{styles}</style></head><body><h2>Pedido #{order_number}</h2><div class="order-info"><p><strong>Data do Pedido:</strong> {order_date}</p><p><strong>Criado por:</strong> {created_by}</p></div><p><strong>Cliente:</strong> {customer_name}</p><p><strong>Data de Entrega:</strong> {delivery_date}</p><table><thead><tr><th>Produto</th><th>Quantidade</th><th>Dimensões</th><th>Opções Extras</th><th>Subtotal</th></tr></thead><tbody>{items}</tbody></table><div class="total">{discount}{additional_value}<p>Valor Total: R$ {total_amount}</p><p>Valor Pago: R$ {paid_amount} {payment_option}</p><p>Saldo Restante: R$ {remaining_balance}</p></div></body></html>',
  '{"title":{"fontSize":16,"margin":20},"header":{"fontSize":12,"margin":10},"itemsTitle":{"fontSize":14,"margin":20},"item":{"fontSize":12,"margin":7,"indent":15},"itemDetails":{"fontSize":10,"margin":7,"indent":20},"extras":{"fontSize":10,"margin":7,"indent":25},"summary":{"fontSize":14,"margin":10,"indent":10},"totals":{"fontSize":12,"margin":7,"indent":15}}'
);