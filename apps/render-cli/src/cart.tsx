import { Column, Row, Text, Image, Button, Checkbox, Stepper, Rating } from './sdk/ui/index.js'

export const SCENARIO_KEY = 'avito-cart'

export default function CartScreen() {
  return (
    <Column style={{ backgroundColor: '#F0F8FF', flexGrow: 1 }}>
      <Column style={{ flexGrow: 1 }}>
        <TopRow />
        <SellerSection storeName="Pear Store" rating="4.8" reviewCount="643" checked={false} />
        <CartItem
          image="https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/magsafe.png"
          price="4 990 ₽"
          title="ЗарядкаMagSafe Charger 15W 1 метр"
          quantity={1}
          checked={true}
        />
        <CartItem
          image="https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/airpods.png"
          price="15 990 ₽"
          title="AirPods Pro 2"
          quantity={1}
          checked={true}
        />
        <CartItem
          image="https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/watch2.png"
          price="26 591 ₽"
          title="Apple Watch 10 42mm Blue"
          quantity={1}
          checked={true}
        />
      </Column>
      <BottomBar />
    </Column>
  )
}

function TopRow() {
  return (
    <Row
      style={{
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#555555',
      }}
    >
      <Checkbox
        style={{
          borderColor: '#0099F7',
          borderRadius: 4,
          marginRight: 16,
        }}
        properties={{ checked: true, disabled: false }}
      />
      <Text
        style={{
          fontSize: 15,
          fontWeight: '500',
          color: '#000000',
          backgroundColor: '#CCCCCC',
          marginRight: 16,
          flexGrow: 1,
        }}
        properties={{ text: 'Выбрать всё' }}
      />
      <Text
        style={{
          fontSize: 15,
          fontWeight: '500',
          color: '#0099F7',
          backgroundColor: '#FFE4E1',
        }}
        properties={{ text: 'Удалить (3)' }}
      />
    </Row>
  )
}

function Price({ price }: { price: string }) {
  return (
    <Text
      style={{ fontSize: 18, fontWeight: '600', backgroundColor: '#E8F5E8', flexShrink: 0 }}
      properties={{ text: price }}
    />
  )
}

function ProductTitle({ title }: { title: string }) {
  return (
    <Text
      style={{ fontSize: 13, fontWeight: '500', backgroundColor: '#FFF8DC', flexMode: 'adjustWidth' }}
      properties={{ text: title }}
    />
  )
}

function SellerSection({
  storeName,
  rating,
  reviewCount,
  checked,
}: {
  storeName: string
  rating: string
  reviewCount: string
  checked: boolean
}) {
  return (
    <Row
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flexStart',
        paddingHorizontal: 16,
        paddingVertical: 4,
        backgroundColor: '#333333',
      }}
    >
      <Checkbox
        style={{ backgroundColor: '#F0F8FF', borderRadius: 4, marginRight: 12 }}
        properties={{ checked: checked, disabled: false }}
      />
      <Text
        style={{
          fontSize: 21,
          fontWeight: '800',
          backgroundColor: '#F0F8FF',
          marginRight: 6,
        }}
        properties={{ text: storeName }}
      />
      <Image
        properties={{
          source: 'https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/star.png',
        }}
        style={{
          width: 16,
          height: 16,
          marginRight: 2,
          backgroundColor: '#E22F3FF',
          alignSelf: 'center',
        }}
      />
      <Text
        style={{
          fontSize: 15,
          fontWeight: '500',
          backgroundColor: '#E6F3FF',
          marginRight: 2,
        }}
        properties={{ text: rating }}
      />
      <Text
        style={{
          fontSize: 15,
          fontWeight: '500',
          color: '#A3A3A3',
          backgroundColor: '#F5F5F5',
        }}
        properties={{ text: reviewCount }}
      />
    </Row>
  )
}

function BuyWithDelivery() {
  return (
    <Text
      style={{ fontSize: 13, fontWeight: '500', color: '#A168F7', backgroundColor: '#F3E5F5' }}
      properties={{ text: 'Купить с доставкой' }}
    />
  )
}

function CountStepper({ quantity }: { quantity: number }) {
  return (
    <Stepper
      style={{ backgroundColor: '#E6F3FF', borderRadius: 8, padding: 8 }}
      properties={{ value: quantity, minimumValue: 1, maximumValue: 10, disabled: false }}
    />
  )
}

function LikeButton() {
  return <Button style={{ backgroundColor: '#FFE0E0', borderRadius: 6, padding: 4 }} properties={{ title: '♡' }} />
}

function DeleteButton() {
  return <Button style={{ backgroundColor: '#FFE0E0', borderRadius: 6, padding: 4 }} properties={{ title: '🗑️' }} />
}

function ProductImage({ image }: { image: string }) {
  return (
    <Image
      style={{ width: 96, height: 96, borderRadius: 12, backgroundColor: '#F5F5F5' }}
      properties={{ source: image }}
    />
  )
}

function ProductCheckbox({ checked }: { checked: boolean }) {
  return (
    <Checkbox
      style={{ backgroundColor: '#F0F8FF', borderRadius: 4, padding: 4 }}
      properties={{ checked: checked, disabled: false }}
    />
  )
}

function CartItem({ image, price, title, quantity, checked }: any) {
  return (
    <Row
      style={{
        alignItems: 'stretch',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFF8E1',
      }}
    >
      <ProductCheckbox checked={checked} />
      <ProductImage image={image} />

      <Row style={{ flexGrow: 1, backgroundColor: '#DCDCDC', flexMode: 'adjustWidth', flexShrink: 1 }}>
        <Column style={{ gap: 2, flexShrink: 1, flexMode: 'adjustWidth' }}>
          <Price price={price} />
          <ProductTitle title={title} />
          <CountStepper quantity={quantity} />
          <BuyWithDelivery />
        </Column>
      </Row>

      <Column style={{ gap: 4, flexShrink: 0 }}>
        <LikeButton />
        <DeleteButton />
      </Column>
    </Row>
  )
}

function BundleSection() {
  return (
    <Column style={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16, backgroundColor: '#E3F2FD' }}>
      <Row style={{ alignItems: 'center', gap: 6 }}>
        <Text
          style={{
            fontSize: 24,
            backgroundColor: '#FFF8DC',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
          properties={{ text: '🎁' }}
        />
        <Column style={{ flexGrow: 1 }}>
          <Row style={{ justifyContent: 'spaceBetween', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '800',
                backgroundColor: '#E3F2FD',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
              properties={{ text: 'Добавьте ещё 1 товар до скидки 5%' }}
            />
            <Button style={{ backgroundColor: '#E0E0E0', borderRadius: 8, padding: 8 }} properties={{ title: '→' }} />
          </Row>
        </Column>
      </Row>

      <Row style={{ gap: 16 }}>
        {/* Recommended Item 1 */}
        <BundleItem
          image="watch.png"
          currentPrice="26 591 ₽"
          originalPrice="27 990 ₽"
          title="Apple Watch 10 42mm Blue"
        />

        {/* Recommended Item 2 */}
        <BundleItem
          image="shorts.png"
          currentPrice="13 314 ₽"
          originalPrice="13 320 ₽"
          title="Шорты мужские новые 44 размер черные"
        />

        {/* More Items */}
        <Column
          style={{
            width: 94,
            height: 94,
            backgroundColor: '#F5F5F5',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Column style={{ alignItems: 'center', gap: 4 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                backgroundColor: '#F5F5F5',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
              properties={{ text: 'Ещё' }}
            />
            <Button style={{ backgroundColor: '#E0E0E0', borderRadius: 8, padding: 8 }} properties={{ title: '→' }} />
          </Column>
        </Column>
      </Row>
    </Column>
  )
}

function BundleItem({ image, currentPrice, originalPrice, title }: any) {
  return (
    <Column style={{ width: 236, gap: 12, backgroundColor: '#F3E5F5' }}>
      <Row style={{ alignItems: 'center', gap: 12 }}>
        <Image
          style={{ width: 94, height: 94, borderRadius: 12, backgroundColor: '#F5F5F5' }}
          properties={{ source: image }}
        />

        <Column style={{ gap: 12, width: 130 }}>
          <Column style={{ gap: 4 }}>
            <Row style={{ gap: 6 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  backgroundColor: '#E8F5E8',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
                properties={{ text: currentPrice }}
              />
              <Row style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: '#757575',
                    backgroundColor: '#F5F5F5',
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                  properties={{ text: originalPrice }}
                />
                <Text
                  style={{
                    color: '#757575',
                    backgroundColor: '#F5F5F5',
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                  properties={{ text: '─' }}
                />
              </Row>
            </Row>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '500',
                backgroundColor: '#FFF8DC',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
              properties={{ text: title }}
            />
          </Column>

          <Button
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: '#E0E0E0',
            }}
            properties={{ title: 'В корзину' }}
          />
        </Column>
      </Row>
    </Column>
  )
}

function BottomBar() {
  return (
    <Column style={{ backgroundColor: '#E8F5E8', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 28 }}>
      <Row style={{ justifyContent: 'spaceBetween', alignItems: 'center', marginBottom: 16 }}>
        <Column>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '500',
              color: '#000000',
              backgroundColor: '#E6F3FF',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
            properties={{ text: '3 товара' }}
          />
          <Text
            style={{
              fontSize: 21,
              fontWeight: '800',
              backgroundColor: '#E8F5E8',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
            properties={{ text: '120 979 ₽' }}
          />
        </Column>

        <Button
          style={{ backgroundColor: '#965EEB', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 17 }}
          properties={{ title: 'Оформить доставку' }}
        />
      </Row>
    </Column>
  )
}
