/**
 * useTabBarListeners
 * Custom hook for managing tab navigation listeners and behaviors
 *
 * Returns object with listener configurations for each tab
 */
export const useTabBarListeners = () => {
  // Home tab: reset stack to show HomeScreen
  const homeTabListeners = ({ navigation }) => ({
    tabPress: (e) => {
      e.preventDefault();
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    },
  });

  return {
    homeTabListeners,
  };
};
