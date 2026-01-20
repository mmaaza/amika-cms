import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Divider,
  Button,
} from '@strapi/design-system';
import { Order } from './types';

// Simple arrow left icon component
const ArrowLeftIcon = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

interface OrderDetailViewProps {
  order: Order;
  onBack: () => void;
}

const getStatusColor = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'secondary' => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'shipped':
    case 'processing':
      return 'primary';
    case 'confirmed':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order, onBack }) => {
  return (
    <Box>
      {/* Back Button */}
      <Box marginBottom={4}>
        <Button variant="tertiary" onClick={onBack} startIcon={<ArrowLeftIcon />}>
          Back to Orders
        </Button>
      </Box>

      {/* Header Section */}
      <Box 
        background="neutral0" 
        hasRadius 
        shadow="filterShadow" 
        paddingTop={6} 
        paddingBottom={6} 
        paddingLeft={6} 
        paddingRight={6}
        marginBottom={6}
      >
        <Flex justifyContent="space-between" alignItems="flex-start" gap={4}>
          <Flex direction="column" gap={2}>
            <Flex alignItems="center" gap={3}>
              <Typography variant="alpha" fontWeight="bold">
                Order #{order.orderNumber}
              </Typography>
              <Badge variant={getStatusColor(order.orderStatus)}>
                {getStatusLabel(order.orderStatus)}
              </Badge>
            </Flex>
            <Typography variant="omega" textColor="neutral600">
              Placed on {formatDate(order.createdAt)}
            </Typography>
          </Flex>
        </Flex>
      </Box>

      {/* Main Content Grid */}
      <Grid.Root gridCols={12} gap={6}>
        {/* Left Column - Order Items */}
        <Grid.Item col={8} xs={12}>
          <Card>
            <Box padding={6}>
              <Typography variant="beta" fontWeight="bold" marginBottom={4}>
                Order Items
              </Typography>
              {order.order_items && order.order_items.length > 0 ? (
                <Box>
                  <Table colCount={5} rowCount={order.order_items.length}>
                    <Thead>
                      <Tr>
                        <Th>
                          <Typography variant="sigma" textColor="neutral600">
                            PRODUCT
                          </Typography>
                        </Th>
                        <Th>
                          <Typography variant="sigma" textColor="neutral600">
                            SIZE
                          </Typography>
                        </Th>
                        <Th>
                          <Typography variant="sigma" textColor="neutral600">
                            QUANTITY
                          </Typography>
                        </Th>
                        <Th>
                          <Typography variant="sigma" textColor="neutral600">
                            UNIT PRICE
                          </Typography>
                        </Th>
                        <Th>
                          <Typography variant="sigma" textColor="neutral600">
                            TOTAL
                          </Typography>
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {order.order_items.map((item) => (
                        <Tr key={item.documentId}>
                          <Td>
                            <Flex direction="column" gap={1}>
                              <Typography variant="omega" fontWeight="semiBold">
                                {item.product?.name || 'N/A'}
                              </Typography>
                              {item.product?.material && (
                                <Typography variant="pi" textColor="neutral600">
                                  {item.product.material}
                                </Typography>
                              )}
                            </Flex>
                          </Td>
                          <Td>
                            <Typography variant="omega">
                              {item.size || 'N/A'}
                            </Typography>
                          </Td>
                          <Td>
                            <Typography variant="omega">
                              {item.quantity}
                            </Typography>
                          </Td>
                          <Td>
                            <Typography variant="omega">
                              {formatPrice(item.priceAtOrder)}
                            </Typography>
                          </Td>
                          <Td>
                            <Typography variant="omega" fontWeight="semiBold">
                              {formatPrice(item.priceAtOrder * item.quantity)}
                            </Typography>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box paddingTop={4} paddingBottom={4}>
                  <Typography variant="omega" textColor="neutral600">
                    No items found for this order.
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid.Item>

        {/* Right Column - Summary & Details */}
        <Grid.Item col={4} xs={12}>
          <Flex direction="column" gap={4}>
            {/* Order Summary Card */}
            <Card>
              <Box padding={6}>
                <Typography variant="beta" fontWeight="bold" marginBottom={4}>
                  Order Summary
                </Typography>
                <Flex direction="column" gap={3}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Typography variant="omega" textColor="neutral600">
                      Subtotal
                    </Typography>
                    <Typography variant="omega" fontWeight="semiBold">
                      {formatPrice(order.totalAmount)}
                    </Typography>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Typography variant="omega" textColor="neutral600">
                      Shipping
                    </Typography>
                    <Typography variant="omega" textColor="success600" fontWeight="semiBold">
                      Complimentary
                    </Typography>
                  </Flex>
                  <Divider />
                  <Flex justifyContent="space-between" alignItems="center">
                    <Typography variant="omega" fontWeight="semiBold">
                      Total
                    </Typography>
                    <Typography variant="omega" fontWeight="bold">
                      {formatPrice(order.totalAmount)}
                    </Typography>
                  </Flex>
                  <Divider />
                  <Flex direction="column" gap={1}>
                    <Typography variant="pi" textColor="neutral600" marginBottom={1}>
                      Payment Method
                    </Typography>
                    <Typography variant="omega" fontWeight="semiBold">
                      {order.paymentMethod.toUpperCase()}
                    </Typography>
                  </Flex>
                </Flex>
              </Box>
            </Card>

            {/* Customer Information Card */}
            <Card>
              <Box padding={6}>
                <Typography variant="beta" fontWeight="bold" marginBottom={4}>
                  Customer Information
                </Typography>
                <Flex direction="column" gap={3}>
                  <Box>
                    <Typography variant="omega" fontWeight="semiBold" marginBottom={1}>
                      {order.firstName} {order.lastName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" textColor="neutral600" marginBottom={1}>
                      Email
                    </Typography>
                    <Typography variant="omega">
                      {order.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" textColor="neutral600" marginBottom={1}>
                      Phone
                    </Typography>
                    <Typography variant="omega">
                      {order.phoneNumber}
                    </Typography>
                  </Box>
                  {order.users_permissions_user && (
                    <Box 
                      marginTop={2} 
                      paddingTop={3} 
                      paddingBottom={3}
                      paddingLeft={3}
                      paddingRight={3}
                      background="neutral100"
                      hasRadius
                    >
                      <Typography variant="pi" textColor="neutral600" marginBottom={1}>
                        User Account
                      </Typography>
                      <Typography variant="omega" fontWeight="semiBold">
                        {order.users_permissions_user.username || order.users_permissions_user.email}
                      </Typography>
                    </Box>
                  )}
                </Flex>
              </Box>
            </Card>

            {/* Shipping Address Card */}
            <Card>
              <Box padding={6}>
                <Typography variant="beta" fontWeight="bold" marginBottom={4}>
                  Shipping Address
                </Typography>
                <Flex direction="column" gap={1}>
                  <Typography variant="omega">
                    {order.shippingAddress}
                  </Typography>
                  <Typography variant="omega">
                    {order.shippingCity}, {order.shippingProvince} {order.shippingZip}
                  </Typography>
                  <Typography variant="omega">
                    {order.shippingCountry}
                  </Typography>
                </Flex>
              </Box>
            </Card>

            {/* Order Notes Card */}
            {order.notes && (
              <Card>
                <Box padding={6}>
                  <Typography variant="beta" fontWeight="bold" marginBottom={4}>
                    Order Notes
                  </Typography>
                  <Typography variant="omega" textColor="neutral600">
                    {order.notes}
                  </Typography>
                </Box>
              </Card>
            )}
          </Flex>
        </Grid.Item>
      </Grid.Root>
    </Box>
  );
};
