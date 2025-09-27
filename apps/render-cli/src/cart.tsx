import { Column, Row, Text, Image, Button, Checkbox, Stepper, Rating, View } from './sdk/ui/index.js'

export const SCENARIO_KEY = 'avito-cart'

export default function CartScreen() {
  return (
    <Column style={{ width: '100%', height: '100%', backgroundColor: '#F0F8FF' }}>
      {/* Navigation Bar */}
      <Row
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          height: 48,
          backgroundColor: '#E6F3FF',
        }}
      >
        <Button style={{ backgroundColor: '#E0E0E0', borderRadius: '8px', padding: 8 }} properties={{ title: '←' }} />
        <Text style={{ fontSize: 18, fontWeight: '800', backgroundColor: '#DDDDDD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }} properties={{ text: 'Корзина' }} />
        <Column style={{ width: 24 }} />
      </Row>

      {/* Select All Section */}
      <Row
        style={{ 
          alignItems: 'center', 
          paddingHorizontal: 16, 
          paddingVertical: 12,
          backgroundColor: '#FFF2E6',
          width: '100%'
        }}
      >
        <Row style={{ alignItems: 'center', gap: 11, flex: 1 }}>
          <View style={{backgroundColor: '#333333'}}>
            <Checkbox 
              style={{ 
                backgroundColor: '#0099F7',
                borderColor: '#0099F7',
                borderRadius: '4px'
              }}
              properties={{ checked: true, disabled: false }} 
            />
          </View>
          <Text 
            style={{ 
              fontSize: 15, 
              fontWeight: '500',
              color: '#000000',
              backgroundColor: '#CCCCCC',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: '6px'
            }} 
            properties={{ text: 'Выбрать всё' }} 
          />
        </Row>
        <Text 
          style={{ 
            fontSize: 15, 
            fontWeight: '500', 
            color: '#000000',
            backgroundColor: '#FFE4E1',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: '6px'
          }} 
          properties={{ text: 'Удалить (3)' }} 
        />
      </Row>

      {/* Content */}
      <Column style={{ flex: 1, paddingHorizontal: 0, backgroundColor: '#FAFAFA' }}>
        {/* Seller Section 1: Pear Store */}
        <SellerSection storeName="Pear Store" rating={4.8} reviewCount={643} checked={true} />

        {/* Cart Items for Pear Store */}
        <Column style={{ backgroundColor: '#E8F5E8', paddingVertical: 24 }}>
          <CartItem
            image="charger.png"
            price="4 990 ₽"
            title="Зарядка MagSafe Charger 15W 1 метр"
            quantity={1}
            checked={true}
          />

          <CartItem image="airpods.png" price="15 990 ₽" title="AirPods Pro 2" quantity={1} checked={true} />
        </Column>

        {/* Bundle/Discount Section */}
        <BundleSection />

        {/* Seller Section 2: TECHNO ZONE */}
        <SellerSection storeName="TECHNO ZONE" rating={5.0} reviewCount={916} checked={true} />

        {/* Cart Item for TECHNO ZONE */}
        <CartItem image="iphone.png" price="99 990 ₽" title="iPhone 16 Pro, 256 ГБ" quantity={1} checked={true} />
      </Column>

      {/* Bottom Bar */}
      <BottomBar />
    </Column>
  )
}

function SellerSection({ storeName, rating, reviewCount, checked }: any) {
  return (
    <Row style={{ alignItems: 'center', gap: 11, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#F0E6FF' }}>
      <Checkbox style={{ backgroundColor: '#F0F8FF', borderRadius: '4px', padding: 4 }} properties={{ checked: checked, disabled: false }} />
      <Row style={{ alignItems: 'center', gap: 5 }}>
        <Text style={{ fontSize: 21, fontWeight: '800', backgroundColor: '#F0F8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }} properties={{ text: storeName }} />
        <Rating style={{ backgroundColor: '#FFF8DC', borderRadius: '6px', padding: 4 }} properties={{ rating: rating, maxRating: 5, interactive: false }} />
        <Text style={{ fontSize: 15, fontWeight: '500', backgroundColor: '#E6F3FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: rating.toString() }} />
        <Text style={{ fontSize: 15, fontWeight: '500', color: '#A3A3A3', backgroundColor: '#F5F5F5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: `(${reviewCount})` }} />
      </Row>
    </Row>
  )
}

function CartItem({ image, price, title, quantity, checked }: any) {
  return (
    <Row style={{ alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFF8E1' }}>
      <Checkbox style={{ backgroundColor: '#F0F8FF', borderRadius: '4px', padding: 4 }} properties={{ checked: checked, disabled: false }} />

      <Image style={{ width: 96, height: 96, borderRadius: '12px', backgroundColor: '#F5F5F5' }} properties={{ source: image }} />

      <Column style={{ flex: 1, gap: 12 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Column style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', backgroundColor: '#E8F5E8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }} properties={{ text: price }} />
            <Text style={{ fontSize: 13, fontWeight: '500', backgroundColor: '#FFF8DC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: title }} />
          </Column>

          <Row style={{ gap: 4 }}>
            <Button style={{ backgroundColor: '#FFE0E0', borderRadius: '6px', padding: 4 }} properties={{ title: '♡' }} />
            <Button style={{ backgroundColor: '#FFE0E0', borderRadius: '6px', padding: 4 }} properties={{ title: '🗑️' }} />
          </Row>
        </Row>

        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stepper style={{ backgroundColor: '#E6F3FF', borderRadius: '8px', padding: 8 }} properties={{ value: quantity, minimumValue: 1, maximumValue: 10, disabled: false }} />
          <Text
            style={{ fontSize: 13, fontWeight: '500', color: '#A168F7', backgroundColor: '#F3E5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }}
            properties={{ text: 'Купить с доставкой' }}
          />
        </Row>
      </Column>
    </Row>
  )
}

function BundleSection() {
  return (
    <Column style={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16, backgroundColor: '#E3F2FD' }}>
      <Row style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 24, backgroundColor: '#FFF8DC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '8px' }} properties={{ text: '🎁' }} />
        <Column style={{ flex: 1 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              style={{ fontSize: 14, fontWeight: '800', backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }}
              properties={{ text: 'Добавьте ещё 1 товар до скидки 5%' }}
            />
            <Button style={{ backgroundColor: '#E0E0E0', borderRadius: '8px', padding: 8 }} properties={{ title: '→' }} />
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
            borderRadius: '12px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Column style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '500', backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }} properties={{ text: 'Ещё' }} />
            <Button style={{ backgroundColor: '#E0E0E0', borderRadius: '8px', padding: 8 }} properties={{ title: '→' }} />
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
        <Image style={{ width: 94, height: 94, borderRadius: '12px', backgroundColor: '#F5F5F5' }} properties={{ source: image }} />

        <Column style={{ gap: 12, width: 130 }}>
          <Column style={{ gap: 4 }}>
            <Row style={{ gap: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', backgroundColor: '#E8F5E8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: currentPrice }} />
              <Row style={{ alignItems: 'center' }}>
                <Text
                  style={{ fontSize: 15, fontWeight: '500', color: '#757575', backgroundColor: '#F5F5F5', paddingHorizontal: 4, paddingVertical: 2, borderRadius: '4px' }}
                  properties={{ text: originalPrice }}
                />
                <Text style={{ color: '#757575', backgroundColor: '#F5F5F5', paddingHorizontal: 4, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: '─' }} />
              </Row>
            </Row>
            <Text style={{ fontSize: 11, fontWeight: '500', backgroundColor: '#FFF8DC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: title }} />
          </Column>

          <Button
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
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
    <Column style={{ backgroundColor: '#E8F5E8', paddingHorizontal: 16, paddingVertical: 16, borderRadius: '28px' }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Column>
          <Text style={{ fontSize: 11, fontWeight: '500', color: '#000000', backgroundColor: '#E6F3FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }} properties={{ text: '3 товара' }} />
          <Text style={{ fontSize: 21, fontWeight: '800', backgroundColor: '#E8F5E8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: '8px' }} properties={{ text: '120 979 ₽' }} />
        </Column>

        <Button
          style={{ backgroundColor: '#965EEB', borderRadius: '16px', paddingHorizontal: 18, paddingVertical: 17 }}
          properties={{ title: 'Оформить доставку' }}
        />
      </Row>

      {/* Home Indicator */}
      <Row style={{ justifyContent: 'center' }}>
        <Column style={{ width: 134, height: 5, backgroundColor: '#000000', borderRadius: '3px' }} />
      </Row>
    </Column>
  )
}
