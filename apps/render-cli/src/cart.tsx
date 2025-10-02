import { Column, Row, Text, Image, Button, Checkbox, Stepper, Rating, View } from '@render-engine/admin-sdk/ui'

export const SCENARIO_KEY = 'avito-cart'

export default function CartScreen() {
  return (
    <Column style={{ flexGrow: 1, backgroundColor: '#ffffff' }}>
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
          fontFamily: 'Manrope',
          fontSize: 15,
          fontWeight: '500',
          color: '#000000',
          marginRight: 16,
          flexGrow: 1,
        }}
        properties={{ text: 'Выбрать всё' }}
      />
      <Text
        style={{
          fontFamily: 'Manrope',
          fontSize: 15,
          fontWeight: '500',
          color: '#0099F7',
        }}
        properties={{ text: 'Удалить (3)' }}
      />
    </Row>
  )
}

function Price({ price }: { price: string }) {
  return (
    <Text
      style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', flexShrink: 0, marginBottom: 2 }}
      properties={{ text: price }}
    />
  )
}

function ProductTitle({ title }: { title: string }) {
  return (
    <Text
      style={{ fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', flexMode: 'adjustWidth' }}
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
      }}
    >
      <Checkbox style={{ borderRadius: 4, marginRight: 16 }} properties={{ checked: checked, disabled: false }} />
      <Text
        style={{
          fontFamily: 'Manrope',
          fontSize: 21,
          fontWeight: '800',
          marginRight: 8,
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
          alignSelf: 'center',
        }}
      />
      <Text
        style={{
          fontFamily: 'Manrope',
          fontSize: 15,
          fontWeight: '500',
          marginRight: 4,
        }}
        properties={{ text: rating }}
      />
      <Text
        style={{
          fontFamily: 'Manrope',
          fontSize: 15,
          fontWeight: '500',
          color: '#A3A3A3',
        }}
        properties={{ text: reviewCount }}
      />
    </Row>
  )
}

function BuyWithDelivery() {
  return (
    <Text
      style={{ fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', color: '#A168F7' }}
      properties={{ text: 'Купить с доставкой' }}
    />
  )
}

function CountStepper({ quantity }: { quantity: number }) {
  return (
    <Stepper
      style={{ borderRadius: 12, marginVertical: 10 }}
      properties={{ value: quantity, minimumValue: 1, maximumValue: 10, disabled: false }}
    />
  )
}

function LikeButton() {
  return (
    <Image
      style={{ borderRadius: 6, width: 24, height: 24 }}
      properties={{
        source: 'https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/favorites.png',
      }}
    />
  )
}

function DeleteButton() {
  return (
    <Image
      style={{ borderRadius: 6, width: 24, height: 24 }}
      properties={{
        source: 'https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/delete.png',
      }}
    />
  )
}

function ProductImage({ image }: { image: string }) {
  return <Image style={{ width: 96, height: 96, borderRadius: 12 }} properties={{ source: image }} />
}

function ProductCheckbox({ checked }: { checked: boolean }) {
  return <Checkbox style={{ borderRadius: 4, padding: 4 }} properties={{ checked: checked, disabled: false }} />
}

function CartItem({ image, price, title, quantity, checked }: any) {
  return (
    <Row
      style={{
        alignItems: 'stretch',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    >
      <ProductCheckbox checked={checked} />
      <ProductImage image={image} />

      <Row style={{ flexGrow: 1, flexMode: 'adjustWidth', flexShrink: 1 }}>
        <Column style={{ gap: 2, flexShrink: 1, flexMode: 'adjustWidth' }}>
          <Price price={price} />
          <ProductTitle title={title} />
          <CountStepper quantity={quantity} />
          <BuyWithDelivery />
        </Column>
      </Row>

      <Column style={{ gap: 6, flexShrink: 0 }}>
        <LikeButton />
        <DeleteButton />
      </Column>
    </Row>
  )
}

function BundleSection() {
  return (
    <Column style={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
      <Row style={{ alignItems: 'center', gap: 6 }}>
        <Text
          style={{
            fontFamily: 'Manrope',
            fontSize: 24,
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
                fontFamily: 'Manrope',
                fontSize: 14,
                fontWeight: '800',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
              properties={{ text: 'Добавьте ещё 1 товар до скидки 5%' }}
            />
            <Button style={{ borderRadius: 8, padding: 8 }} properties={{ title: '→' }} />
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
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Column style={{ alignItems: 'center', gap: 4 }}>
            <Text
              style={{
                fontFamily: 'Manrope',
                fontSize: 15,
                fontWeight: '500',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
              properties={{ text: 'Ещё' }}
            />
            <Button style={{ borderRadius: 8, padding: 8 }} properties={{ title: '→' }} />
          </Column>
        </Column>
      </Row>
    </Column>
  )
}

function BundleItem({ image, currentPrice, originalPrice, title }: any) {
  return (
    <Column style={{ width: 236, gap: 12 }}>
      <Row style={{ alignItems: 'center', gap: 12 }}>
        <Image style={{ width: 94, height: 94, borderRadius: 12 }} properties={{ source: image }} />

        <Column style={{ gap: 12, width: 130 }}>
          <Column style={{ gap: 4 }}>
            <Row style={{ gap: 6 }}>
              <Text
                style={{
                  fontFamily: 'Manrope',
                  fontSize: 16,
                  fontWeight: '800',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
                properties={{ text: currentPrice }}
              />
              <Row style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: 'Manrope',
                    fontSize: 15,
                    fontWeight: '500',
                    color: '#757575',
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                  properties={{ text: originalPrice }}
                />
                <Text
                  style={{
                    fontFamily: 'Manrope',
                    color: '#757575',
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
                fontFamily: 'Manrope',
                fontSize: 11,
                fontWeight: '500',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
              properties={{ text: title }}
            />
          </Column>

          <Button
            style={{
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
    <Column
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 28,
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: -4 },
        shadowOpacity: 0.8,
        shadowRadius: 24,
        backgroundColor: '#DCDCDC',
      }}
    >
      <Row style={{ justifyContent: 'spaceBetween', alignItems: 'center', marginBottom: 16 }}>
        <Column>
          <Text
            style={{
              fontFamily: 'Manrope',
              fontSize: 11,
              fontWeight: '500',
              color: '#000000',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
            properties={{ text: '3 товара' }}
          />
          <Text
            style={{
              fontFamily: 'Manrope',
              fontSize: 21,
              fontWeight: '800',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
            properties={{ text: '120 979 ₽' }}
          />
        </Column>

        <Button
          style={{ borderRadius: 16, paddingHorizontal: 18, paddingVertical: 17, backgroundColor: '#965EEB' }}
          titleStyle={{ color: '#FFFFFF', fontWeight: '500', fontSize: 15 }}
          properties={{ title: 'Оформить доставку' }}
        />
      </Row>
    </Column>
  )
}
