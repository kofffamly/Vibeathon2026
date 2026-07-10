-- Rendre latitude et longitude optionnelles dans recoltes
alter table public.recoltes alter column latitude drop not null;
alter table public.recoltes alter column longitude drop not null;
