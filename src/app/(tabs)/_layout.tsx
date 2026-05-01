import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: Array<{
  name: string;
  title: string;
  icon: IoniconName;
  activeIcon: IoniconName;
}> = [
  { name: 'learn',   title: 'Learn',   icon: 'book-outline',        activeIcon: 'book' },
  { name: 'write',   title: 'Write',   icon: 'create-outline',      activeIcon: 'create' },
  { name: 'read',    title: 'Read',    icon: 'chatbubbles-outline',  activeIcon: 'chatbubbles' },
  { name: 'review',  title: 'Review',  icon: 'refresh-outline',      activeIcon: 'refresh' },
  { name: 'profile', title: 'Profile', icon: 'person-outline',       activeIcon: 'person' },
];

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIconStyle: { marginBottom: -2 },
      }}
    >
      {TABS.map(({ name, title, icon, activeIcon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? activeIcon : icon} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
