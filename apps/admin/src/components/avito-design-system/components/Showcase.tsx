import React from 'react';
import { Button } from './Button';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { Input, TextArea } from './Input';
import { Badge, StatusBadge, DotBadge } from './Badge';
import { Avatar, AvatarGroup } from './Avatar';
import { Container, Section } from '../layout/Container';
import { Grid, GridItem, Flex } from '../layout/Grid';
import { ProductCard, ListItem } from './ProductCard';

export const DesignSystemShowcase: React.FC = () => {
  return (
    <div className="avito-theme min-h-screen bg-avito-neutral-50">
      <Container>
        <Section padding="xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-avito-neutral-900 mb-4">
              Avito Design System
            </h1>
            <p className="text-lg text-avito-neutral-600 max-w-2xl mx-auto">
              A comprehensive design system inspired by Avito's clean, modern interface
            </p>
          </div>

          {/* Buttons Section */}
          <Section divider>
            <Card>
              <CardHeader title="Buttons" />
              <CardContent>
                <Grid cols={{ md: 2, lg: 4 }} gap="md">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-avito-neutral-900">Primary</h4>
                    <Flex direction="col" gap="sm">
                      <Button variant="primary" size="sm">Small</Button>
                      <Button variant="primary" size="md">Medium</Button>
                      <Button variant="primary" size="lg">Large</Button>
                    </Flex>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-avito-neutral-900">Secondary</h4>
                    <Flex direction="col" gap="sm">
                      <Button variant="secondary" size="sm">Small</Button>
                      <Button variant="secondary" size="md">Medium</Button>
                      <Button variant="secondary" size="lg">Large</Button>
                    </Flex>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-avito-neutral-900">Outline</h4>
                    <Flex direction="col" gap="sm">
                      <Button variant="outline" size="sm">Small</Button>
                      <Button variant="outline" size="md">Medium</Button>
                      <Button variant="outline" size="lg">Large</Button>
                    </Flex>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-avito-neutral-900">Ghost</h4>
                    <Flex direction="col" gap="sm">
                      <Button variant="ghost" size="sm">Small</Button>
                      <Button variant="ghost" size="md">Medium</Button>
                      <Button variant="ghost" size="lg">Large</Button>
                    </Flex>
                  </div>
                </Grid>
              </CardContent>
            </Card>
          </Section>

          {/* Cards Section */}
          <Section divider>
            <Card>
              <CardHeader title="Cards" />
              <CardContent>
                <Grid cols={{ md: 2, lg: 3 }} gap="md">
                  <Card variant="default">
                    <CardHeader title="Default Card" subtitle="Standard card design" />
                    <CardContent>
                      <p className="text-sm text-avito-neutral-600">
                        This is a default card with header and content sections.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="primary" size="sm">Action</Button>
                    </CardFooter>
                  </Card>

                  <Card variant="outlined">
                    <CardHeader title="Outlined Card" subtitle="With border emphasis" />
                    <CardContent>
                      <p className="text-sm text-avito-neutral-600">
                        This card has a more prominent border style.
                      </p>
                    </CardContent>
                  </Card>

                  <Card variant="elevated">
                    <CardHeader title="Elevated Card" subtitle="With shadow depth" />
                    <CardContent>
                      <p className="text-sm text-avito-neutral-600">
                        This card has a subtle shadow for depth.
                      </p>
                    </CardContent>
                  </Card>
                </Grid>
              </CardContent>
            </Card>
          </Section>

          {/* Inputs Section */}
          <Section divider>
            <Card>
              <CardHeader title="Inputs" />
              <CardContent>
                <Grid cols={{ md: 1, lg: 2 }} gap="md">
                  <div className="space-y-4">
                    <Input
                      label="Email"
                      placeholder="Enter your email"
                      type="email"
                    />
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      type="password"
                    />
                    <Input
                      label="Phone"
                      placeholder="+7 (999) 123-45-67"
                      type="tel"
                    />
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="With Error"
                      placeholder="This field has an error"
                      error="Please enter a valid email"
                    />
                    <Input
                      label="With Helper Text"
                      placeholder="Helper text below"
                      helperText="This is additional information"
                    />
                    <TextArea
                      label="Message"
                      placeholder="Enter your message here..."
                      rows={4}
                    />
                  </div>
                </Grid>
              </CardContent>
            </Card>
          </Section>

          {/* Badges Section */}
          <Section divider>
            <Card>
              <CardHeader title="Badges" />
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-avito-neutral-900 mb-3">Variant Badges</h4>
                    <Flex gap="sm" wrap="wrap">
                      <Badge variant="default">Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="error">Error</Badge>
                    </Flex>
                  </div>

                  <div>
                    <h4 className="font-semibold text-avito-neutral-900 mb-3">Status Badges</h4>
                    <Flex gap="sm" wrap="wrap">
                      <StatusBadge status="active" />
                      <StatusBadge status="inactive" />
                      <StatusBadge status="pending" />
                      <StatusBadge status="completed" />
                      <StatusBadge status="failed" />
                      <StatusBadge status="new" />
                    </Flex>
                  </div>

                  <div>
                    <h4 className="font-semibold text-avito-neutral-900 mb-3">Dot Badges</h4>
                    <Flex gap="sm" align="center">
                      <DotBadge variant="default" />
                      <DotBadge variant="success" />
                      <DotBadge variant="warning" />
                      <DotBadge variant="error" />
                      <span className="text-sm text-avito-neutral-600">Status indicators</span>
                    </Flex>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Avatars Section */}
          <Section divider>
            <Card>
              <CardHeader title="Avatars" />
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-avito-neutral-900 mb-3">Sizes</h4>
                    <Flex gap="md" align="center">
                      <Avatar size="sm" alt="Small" fallback="JS" />
                      <Avatar size="md" alt="Medium" fallback="JD" />
                      <Avatar size="lg" alt="Large" fallback="AS" />
                      <Avatar size="xl" alt="Extra Large" fallback="MK" />
                    </Flex>
                  </div>

                  <div>
                    <h4 className="font-semibold text-avito-neutral-900 mb-3">Status Indicators</h4>
                    <Flex gap="md" align="center">
                      <Avatar size="md" alt="Online" fallback="OL" status="online" />
                      <Avatar size="md" alt="Offline" fallback="OF" status="offline" />
                      <Avatar size="md" alt="Away" fallback="AW" status="away" />
                      <Avatar size="md" alt="Busy" fallback="BU" status="busy" />
                    </Flex>
                  </div>

                  <div>
                    <h4 className="font-semibold text-avito-neutral-900 mb-3">Avatar Group</h4>
                    <AvatarGroup
                      avatars={[
                        { alt: 'User 1', fallback: 'U1' },
                        { alt: 'User 2', fallback: 'U2' },
                        { alt: 'User 3', fallback: 'U3' },
                        { alt: 'User 4', fallback: 'U4' },
                        { alt: 'User 5', fallback: 'U5' },
                        { alt: 'User 6', fallback: 'U6' },
                      ]}
                      size="md"
                      max={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Product Cards Section */}
          <Section divider>
            <Card>
              <CardHeader title="Product Cards" />
              <CardContent>
                <Grid cols={{ md: 1, lg: 2, xl: 3 }} gap="md">
                  <ProductCard
                    title="Professional Website Development"
                    description="Custom website development with modern technologies and responsive design"
                    price="From $1,500"
                    image="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop"
                    category="Web Development"
                    rating={4.8}
                    reviews={124}
                    featured={true}
                    actions={<Button variant="primary" size="sm">View Details</Button>}
                  />

                  <ProductCard
                    title="Mobile App Design"
                    description="UI/UX design for mobile applications with prototyping"
                    price="From $800"
                    image="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop"
                    category="Design"
                    rating={4.6}
                    reviews={89}
                    status="active"
                    actions={<Button variant="secondary" size="sm">Learn More</Button>}
                  />

                  <ProductCard
                    title="SEO Optimization"
                    description="Search engine optimization to improve your website ranking"
                    price="From $300/month"
                    image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop"
                    category="Marketing"
                    rating={4.9}
                    reviews={156}
                    showFavoriteButton={true}
                    isFavorite={false}
                    actions={<Button variant="outline" size="sm">Get Started</Button>}
                  />
                </Grid>
              </CardContent>
            </Card>
          </Section>

          {/* List Items Section */}
          <Section>
            <Card>
              <CardHeader title="List Items" />
              <CardContent>
                <div className="space-y-3">
                  <ListItem
                    icon={<div className="w-8 h-8 bg-avito-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-avito-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>}
                    title="Website Development"
                    subtitle="Starting from $1,500"
                    description="Complete website development with modern technologies"
                    badge={<Badge variant="success" size="sm">Popular</Badge>}
                    rightContent={<Button variant="ghost" size="sm">View</Button>}
                  />

                  <ListItem
                    icon={<div className="w-8 h-8 bg-avito-warning-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-avito-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>}
                    title="UI/UX Design"
                    subtitle="Starting from $800"
                    description="Professional design services for web and mobile"
                    badge={<Badge variant="warning" size="sm">New</Badge>}
                    rightContent={<Button variant="ghost" size="sm">View</Button>}
                  />

                  <ListItem
                    icon={<div className="w-8 h-8 bg-avito-error-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-avito-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>}
                    title="SEO Optimization"
                    subtitle="Starting from $300/month"
                    description="Improve your search engine rankings"
                    badge={<StatusBadge status="active" size="sm" />}
                    rightContent={<Button variant="ghost" size="sm">View</Button>}
                  />
                </div>
              </CardContent>
            </Card>
          </Section>
        </Section>
      </Container>
    </div>
  );
};