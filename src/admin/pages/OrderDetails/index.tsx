import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Button,
  Loader,
  EmptyStateLayout,
  Alert,
} from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { Order } from './types';
import { OrderDetailView } from './OrderDetailView';

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
    month: 'short',
    day: 'numeric',
  });
};

const OrderDetails: React.FC = () => {
  const { get } = useFetchClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use Content Manager API endpoint for admin panel
      // This endpoint is specifically designed for admin use and has proper authentication
      const params = new URLSearchParams();
      params.append('pageSize', '100');
      params.append('sort', 'createdAt:desc');
      params.append('populate[order_items][populate][product]', '*');
      params.append('populate[users_permissions_user]', '*');
      
      const response = await get(`/content-manager/collection-types/api::order.order?${params.toString()}`);

      // Content Manager API returns { results: [...] } for collections
      const ordersData = response.data?.results || response.data?.data || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      const errorMessage = err?.response?.data?.error?.message 
        || err?.response?.data?.message 
        || err?.message 
        || 'Failed to fetch orders';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box paddingLeft={10} paddingRight={10} paddingTop={8} paddingBottom={8}>
        <Flex justifyContent="center" alignItems="center" minHeight="400px">
          <Loader>Loading orders...</Loader>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box paddingLeft={10} paddingRight={10} paddingTop={8} paddingBottom={8}>
        <Alert closeLabel="Close" title="Error" variant="danger">
          {error}
        </Alert>
        <Box marginTop={4}>
          <Button onClick={fetchOrders}>Retry</Button>
        </Box>
      </Box>
    );
  }

  // Show detail view if an order is selected
  if (selectedOrder) {
    return (
      <Box paddingLeft={10} paddingRight={10} paddingTop={8} paddingBottom={8}>
        <Box marginBottom={4}>
          <Button variant="tertiary" onClick={() => setSelectedOrder(null)}>
            ← Back to Orders
          </Button>
        </Box>
        <OrderDetailView order={selectedOrder} onBack={() => setSelectedOrder(null)} />
      </Box>
    );
  }

  // Show list view - using Strapi's standard layout pattern
  return (
    <Box paddingLeft={10} paddingRight={10} paddingTop={8} paddingBottom={8}>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Typography variant="alpha" fontWeight="bold">
          Order Details
        </Typography>
        <Button variant="secondary" onClick={fetchOrders}>
          Refresh
        </Button>
      </Flex>

      {/* Content */}
      {orders.length === 0 ? (
        <EmptyStateLayout
          icon={<Typography variant="alpha">📦</Typography>}
          content="No orders found"
          action={
            <Button variant="secondary" onClick={fetchOrders}>
              Refresh
            </Button>
          }
        />
      ) : (
        <Card>
          <Table colCount={6} rowCount={orders.length}>
            <Thead>
              <Tr>
                <Th>
                  <Typography variant="sigma" textColor="neutral600">
                    Order Number
                  </Typography>
                </Th>
                <Th>
                  <Typography variant="sigma" textColor="neutral600">
                    Status
                  </Typography>
                </Th>
                <Th>
                  <Typography variant="sigma" textColor="neutral600">
                    Customer
                  </Typography>
                </Th>
                <Th>
                  <Typography variant="sigma" textColor="neutral600">
                    Total
                  </Typography>
                </Th>
                <Th>
                  <Typography variant="sigma" textColor="neutral600">
                    Date
                  </Typography>
                </Th>
                <Th>
                  <Typography variant="sigma" textColor="neutral600">
                    Actions
                  </Typography>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.documentId}>
                  <Td>
                    <Typography variant="omega" fontWeight="semiBold">
                      #{order.orderNumber}
                    </Typography>
                  </Td>
                  <Td>
                    <Badge variant={getStatusColor(order.orderStatus)}>
                      {getStatusLabel(order.orderStatus)}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex direction="column" gap={1}>
                      <Typography variant="omega">
                        {order.firstName} {order.lastName}
                      </Typography>
                      <Typography variant="pi" textColor="neutral600">
                        {order.email}
                      </Typography>
                    </Flex>
                  </Td>
                  <Td>
                    <Typography variant="omega" fontWeight="semiBold">
                      {formatPrice(order.totalAmount)}
                    </Typography>
                  </Td>
                  <Td>
                    <Typography variant="omega" textColor="neutral600">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Td>
                  <Td>
                    <Button
                      variant="tertiary"
                      size="S"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}
    </Box>
  );
};

export default OrderDetails;
